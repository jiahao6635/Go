import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '../contexts/Web3Context'
import YuanGouLotteryABI from '../contracts/YuanGouLottery.json'

// 合约地址 (部署后替换)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

export interface Project {
  id: number
  name: string
  description: string
  imageUrl: string
  totalAmount: bigint
  currentAmount: bigint
  ticketPrice: bigint
  maxTickets: number
  soldTickets: number
  deadline: number
  winner: string
  isCompleted: boolean
  isDrawn: boolean
  status: number
}

export interface Participant {
  user: string
  ticketCount: number
  amount: bigint
}

export const useContract = () => {
  const { provider, signer, isConnected } = useWeb3()
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('🔍 Contract initialization check:')
    console.log('  - Contract Address:', CONTRACT_ADDRESS)
    console.log('  - Provider available:', !!provider)
    console.log('  - Is Connected:', isConnected)
    console.log('  - Provider type:', provider?.constructor?.name)
    
    // 添加延迟以确保provider完全初始化
    const initializeContract = async () => {
      if (provider && isConnected && CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
        try {
          console.log('🚀 Creating contract instance...')
          const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            YuanGouLotteryABI.abi,
            provider
          )
          
          // 测试合约连接
          try {
            const network = await provider.getNetwork()
            console.log('📡 Network info:', network.chainId, network.name)
            
            setContract(contractInstance)
            console.log('✅ Contract instance created successfully')
          } catch (networkError) {
            console.error('❌ Network connection failed:', networkError)
            setContract(null)
          }
        } catch (error) {
          console.error('❌ Failed to create contract instance:', error)
          setContract(null)
        }
      } else {
        console.warn('⚠️ Contract setup conditions not met:', { 
          hasProvider: !!provider, 
          isConnected, 
          hasAddress: !!CONTRACT_ADDRESS,
          addressValue: CONTRACT_ADDRESS
        })
        setContract(null)
      }
    }

    // 添加短暂延迟以确保所有状态已更新
    const timer = setTimeout(initializeContract, 100)
    return () => clearTimeout(timer)
  }, [provider, isConnected, CONTRACT_ADDRESS])

  // 获取所有活跃项目
  const getActiveProjects = async (): Promise<number[]> => {
    if (!contract) {
      console.warn('Contract not available. Address:', CONTRACT_ADDRESS)
      return [] // 返回空数组而不是抛出错误
    }
    
    setIsLoading(true)
    try {
      const activeProjectIds = await contract.getActiveProjects()
      return activeProjectIds.map((id: bigint) => Number(id))
    } catch (error) {
      console.error('获取活跃项目失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 获取项目详情
  const getProject = async (projectId: number): Promise<Project> => {
    if (!contract || !isConnected) {
      console.warn('Contract or wallet not ready:', { hasContract: !!contract, isConnected })
      throw new Error(`请先连接钱包并确保网络正确 (地址: ${CONTRACT_ADDRESS})`)
    }
    
    try {
      const project = await contract.projects(projectId)
      return {
        id: Number(project.id),
        name: project.name,
        description: project.description,
        imageUrl: project.imageUrl,
        totalAmount: project.totalAmount,
        currentAmount: project.currentAmount,
        ticketPrice: project.ticketPrice,
        maxTickets: Number(project.maxTickets),
        soldTickets: Number(project.soldTickets),
        deadline: Number(project.deadline),
        winner: project.winner,
        isCompleted: project.isCompleted,
        isDrawn: project.isDrawn,
        status: Number(project.status),
      }
    } catch (error) {
      console.error('获取项目详情失败:', error)
      throw error
    }
  }

  // 创建项目 (仅管理员)
  const createProject = async (
    name: string,
    description: string,
    imageUrl: string,
    totalAmount: string,
    ticketPrice: string,
    durationInHours: number
  ) => {
    if (!contract || !signer) throw new Error('合约或签名者未连接')
    
    setIsLoading(true)
    try {
      const contractWithSigner = contract.connect(signer)
      const totalAmountWei = ethers.parseEther(totalAmount)
      const ticketPriceWei = ethers.parseEther(ticketPrice)

      const tx = await contractWithSigner.createProject(
        name,
        description,
        imageUrl,
        totalAmountWei,
        ticketPriceWei,
        durationInHours
      )
      
      await tx.wait()
      return tx
    } catch (error) {
      console.error('创建项目失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 购买抽奖券
  const buyTickets = async (projectId: number, ticketCount: number, ticketPrice: bigint) => {
    if (!contract || !signer) throw new Error('合约或签名者未连接')
    
    setIsLoading(true)
    try {
      const contractWithSigner = contract.connect(signer)
      const totalCost = ticketPrice * BigInt(ticketCount)

      const tx = await contractWithSigner.buyTickets(projectId, ticketCount, {
        value: totalCost
      })
      
      await tx.wait()
      return tx
    } catch (error) {
      console.error('购买抽奖券失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 获取项目参与者
  const getProjectParticipants = async (projectId: number): Promise<Participant[]> => {
    if (!contract) throw new Error('合约未连接')
    
    try {
      const participants = await contract.getProjectParticipants(projectId)
      return participants.map((p: any) => ({
        user: p.user,
        ticketCount: Number(p.ticketCount),
        amount: p.amount,
      }))
    } catch (error) {
      console.error('获取项目参与者失败:', error)
      throw error
    }
  }

  // 获取用户参与情况
  const getUserParticipation = async (projectId: number, userAddress: string): Promise<Participant> => {
    if (!contract || !isConnected) {
      console.warn('Contract or wallet not ready for getUserParticipation:', { 
        hasContract: !!contract, 
        isConnected,
        contractAddress: CONTRACT_ADDRESS
      })
      throw new Error('请先连接钱包并确保网络正确')
    }
    
    try {
      const participation = await contract.userParticipation(projectId, userAddress)
      return {
        user: participation.user,
        ticketCount: Number(participation.ticketCount),
        amount: participation.amount,
      }
    } catch (error) {
      console.error('获取用户参与情况失败:', error)
      throw error
    }
  }

  // 处理过期项目退款
  const processRefund = async (projectId: number) => {
    if (!contract || !signer) throw new Error('合约或签名者未连接')
    
    setIsLoading(true)
    try {
      const contractWithSigner = contract.connect(signer)
      const tx = await contractWithSigner.processRefund(projectId)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('处理退款失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 手动抽奖 (仅管理员)
  const drawLottery = async (projectId: number) => {
    if (!contract || !signer) throw new Error('合约或签名者未连接')
    
    setIsLoading(true)
    try {
      const contractWithSigner = contract.connect(signer)
      const tx = await contractWithSigner.drawLottery(projectId)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('抽奖失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    contract,
    isLoading,
    isConnected,
    contractAddress: CONTRACT_ADDRESS,
    getActiveProjects,
    getProject,
    createProject,
    buyTickets,
    getProjectParticipants,
    getUserParticipation,
    processRefund,
    drawLottery,
  }
}
