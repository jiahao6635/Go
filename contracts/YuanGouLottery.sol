// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title YuanGouLottery
 * @dev 一元购众筹抽奖智能合约
 */
contract YuanGouLottery is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    struct Project {
        uint256 id;                    // 项目ID
        string name;                   // 项目名称
        string description;            // 项目描述
        string imageUrl;               // 项目图片
        uint256 totalAmount;           // 目标筹款金额
        uint256 currentAmount;         // 当前筹款金额
        uint256 ticketPrice;           // 每张抽奖券价格
        uint256 maxTickets;            // 最大抽奖券数量
        uint256 soldTickets;           // 已售抽奖券数量
        uint256 deadline;              // 众筹截止时间
        address winner;                // 获奖者地址
        bool isCompleted;              // 是否完成
        bool isDrawn;                  // 是否已抽奖
        ProjectStatus status;          // 项目状态
    }

    enum ProjectStatus {
        Active,      // 进行中
        Completed,   // 已完成
        Failed,      // 失败
        Refunded     // 已退款
    }

    struct Participant {
        address user;                  // 参与者地址
        uint256 ticketCount;           // 购买的抽奖券数量
        uint256 amount;                // 投资金额
    }

    // 项目映射
    mapping(uint256 => Project) public projects;
    
    // 项目参与者映射 projectId => participants
    mapping(uint256 => Participant[]) public projectParticipants;
    
    // 用户在项目中的参与情况 projectId => user => Participant
    mapping(uint256 => mapping(address => Participant)) public userParticipation;
    
    // 项目计数器
    uint256 public projectCounter;
    
    // 平台手续费比例 (basis points, 100 = 1%)
    uint256 public platformFeeRate = 200; // 2%
    
    // 平台收入
    uint256 public platformBalance;

    // 事件定义
    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        uint256 totalAmount,
        uint256 ticketPrice,
        uint256 deadline
    );
    
    event TicketPurchased(
        uint256 indexed projectId,
        address indexed buyer,
        uint256 ticketCount,
        uint256 amount
    );
    
    event LotteryDrawn(
        uint256 indexed projectId,
        address indexed winner,
        uint256 prizeAmount
    );
    
    event ProjectRefunded(
        uint256 indexed projectId,
        uint256 totalRefunded
    );

    constructor() {}

    /**
     * @dev 创建新项目
     */
    function createProject(
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        uint256 _totalAmount,
        uint256 _ticketPrice,
        uint256 _durationInHours
    ) external onlyOwner {
        require(_totalAmount > 0, "Total amount must be greater than 0");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_durationInHours > 0, "Duration must be greater than 0");
        require(_totalAmount % _ticketPrice == 0, "Total amount must be divisible by ticket price");

        projectCounter++;
        uint256 deadline = block.timestamp + (_durationInHours * 1 hours);
        uint256 maxTickets = _totalAmount.div(_ticketPrice);

        projects[projectCounter] = Project({
            id: projectCounter,
            name: _name,
            description: _description,
            imageUrl: _imageUrl,
            totalAmount: _totalAmount,
            currentAmount: 0,
            ticketPrice: _ticketPrice,
            maxTickets: maxTickets,
            soldTickets: 0,
            deadline: deadline,
            winner: address(0),
            isCompleted: false,
            isDrawn: false,
            status: ProjectStatus.Active
        });

        emit ProjectCreated(projectCounter, _name, _totalAmount, _ticketPrice, deadline);
    }

    /**
     * @dev 购买抽奖券
     */
    function buyTickets(uint256 _projectId, uint256 _ticketCount) 
        external 
        payable 
        nonReentrant 
    {
        Project storage project = projects[_projectId];
        require(project.id != 0, "Project does not exist");
        require(project.status == ProjectStatus.Active, "Project is not active");
        require(block.timestamp < project.deadline, "Project has expired");
        require(_ticketCount > 0, "Ticket count must be greater than 0");
        require(
            project.soldTickets.add(_ticketCount) <= project.maxTickets, 
            "Not enough tickets available"
        );
        
        uint256 totalCost = project.ticketPrice.mul(_ticketCount);
        require(msg.value == totalCost, "Incorrect payment amount");

        // 更新项目状态
        project.currentAmount = project.currentAmount.add(totalCost);
        project.soldTickets = project.soldTickets.add(_ticketCount);

        // 更新用户参与信息
        Participant storage participant = userParticipation[_projectId][msg.sender];
        if (participant.user == address(0)) {
            // 新用户
            participant.user = msg.sender;
            participant.ticketCount = _ticketCount;
            participant.amount = totalCost;
            projectParticipants[_projectId].push(participant);
        } else {
            // 现有用户追加购买
            participant.ticketCount = participant.ticketCount.add(_ticketCount);
            participant.amount = participant.amount.add(totalCost);
        }

        emit TicketPurchased(_projectId, msg.sender, _ticketCount, totalCost);

        // 检查是否达到目标金额
        if (project.currentAmount >= project.totalAmount) {
            project.status = ProjectStatus.Completed;
            project.isCompleted = true;
            _drawLottery(_projectId);
        }
    }

    /**
     * @dev 执行抽奖
     */
    function _drawLottery(uint256 _projectId) internal {
        Project storage project = projects[_projectId];
        require(project.isCompleted && !project.isDrawn, "Cannot draw lottery");

        // 生成随机数选择获奖者
        uint256 winningTicket = _generateRandomNumber(_projectId) % project.soldTickets;
        uint256 ticketCounter = 0;
        address winner;

        // 根据抽奖券数量比例确定获奖者
        Participant[] storage participants = projectParticipants[_projectId];
        for (uint i = 0; i < participants.length; i++) {
            ticketCounter = ticketCounter.add(participants[i].ticketCount);
            if (winningTicket < ticketCounter) {
                winner = participants[i].user;
                break;
            }
        }

        project.winner = winner;
        project.isDrawn = true;

        // 计算平台手续费
        uint256 platformFee = project.currentAmount.mul(platformFeeRate).div(10000);
        uint256 prizeAmount = project.currentAmount.sub(platformFee);
        
        platformBalance = platformBalance.add(platformFee);

        // 发放奖金
        (bool success, ) = payable(winner).call{value: prizeAmount}("");
        require(success, "Prize transfer failed");

        emit LotteryDrawn(_projectId, winner, prizeAmount);
    }

    /**
     * @dev 手动抽奖（当项目完成但未自动抽奖时）
     */
    function drawLottery(uint256 _projectId) external onlyOwner {
        Project storage project = projects[_projectId];
        require(project.isCompleted && !project.isDrawn, "Cannot draw lottery");
        _drawLottery(_projectId);
    }

    /**
     * @dev 处理过期项目退款
     */
    function processRefund(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(project.id != 0, "Project does not exist");
        require(block.timestamp >= project.deadline, "Project has not expired");
        require(project.status == ProjectStatus.Active, "Project is not active");
        require(!project.isCompleted, "Project is already completed");

        project.status = ProjectStatus.Failed;

        // 退款给所有参与者
        Participant[] storage participants = projectParticipants[_projectId];
        uint256 totalRefunded = 0;
        
        for (uint i = 0; i < participants.length; i++) {
            if (participants[i].amount > 0) {
                (bool success, ) = payable(participants[i].user).call{value: participants[i].amount}("");
                require(success, "Refund failed");
                totalRefunded = totalRefunded.add(participants[i].amount);
            }
        }

        project.status = ProjectStatus.Refunded;
        emit ProjectRefunded(_projectId, totalRefunded);
    }

    /**
     * @dev 生成伪随机数
     */
    function _generateRandomNumber(uint256 _projectId) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            _projectId,
            projects[_projectId].soldTickets
        )));
    }

    /**
     * @dev 获取项目参与者信息
     */
    function getProjectParticipants(uint256 _projectId) 
        external 
        view 
        returns (Participant[] memory) 
    {
        return projectParticipants[_projectId];
    }

    /**
     * @dev 获取用户在项目中的参与情况
     */
    function getUserParticipation(uint256 _projectId, address _user) 
        external 
        view 
        returns (Participant memory) 
    {
        return userParticipation[_projectId][_user];
    }

    /**
     * @dev 设置平台手续费率
     */
    function setPlatformFeeRate(uint256 _feeRate) external onlyOwner {
        require(_feeRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _feeRate;
    }

    /**
     * @dev 提取平台收入
     */
    function withdrawPlatformBalance() external onlyOwner {
        require(platformBalance > 0, "No balance to withdraw");
        uint256 amount = platformBalance;
        platformBalance = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev 获取所有活跃项目
     */
    function getActiveProjects() external view returns (uint256[] memory) {
        uint256[] memory activeProjects = new uint256[](projectCounter);
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= projectCounter; i++) {
            if (projects[i].status == ProjectStatus.Active && 
                block.timestamp < projects[i].deadline) {
                activeProjects[activeCount] = i;
                activeCount++;
            }
        }
        
        // 创建正确大小的数组
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeProjects[i];
        }
        
        return result;
    }
}
