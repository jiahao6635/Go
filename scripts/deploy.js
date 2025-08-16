const hre = require("hardhat");

async function main() {
  console.log("开始部署 YuanGouLottery 合约...");

  // 获取合约工厂
  const YuanGouLottery = await hre.ethers.getContractFactory("YuanGouLottery");
  
  // 部署合约
  console.log("正在部署合约...");
  const yuanGouLottery = await YuanGouLottery.deploy();
  
  // 等待部署完成
  await yuanGouLottery.waitForDeployment();
  
  const contractAddress = await yuanGouLottery.getAddress();
  console.log("✅ YuanGouLottery 合约已成功部署到:", contractAddress);
  
  // 显示部署信息
  console.log("\n📋 部署信息:");
  console.log("- 合约地址:", contractAddress);
  console.log("- 网络:", hre.network.name);
  console.log("- 部署者:", (await hre.ethers.getSigners())[0].address);
  
  // 验证合约 (如果是测试网或主网)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 等待区块确认以验证合约...");
    await yuanGouLottery.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ 合约验证成功");
    } catch (error) {
      console.log("❌ 合约验证失败:", error.message);
    }
  }

  // 输出前端配置信息
  console.log("\n🔧 前端配置:");
  console.log(`请将以下地址添加到 .env.local 文件:`);
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
  
  // 创建示例项目 (仅在本地开发时)
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("\n🎯 创建示例项目...");
    
    try {
      // 创建一个示例项目
      const tx = await yuanGouLottery.createProject(
        "iPhone 15 Pro Max",
        "全新 iPhone 15 Pro Max 1TB，原价 ¥12999。每张抽奖券 0.01 ETH，共 100 张券。",
        "https://example.com/iphone15.jpg",
        hre.ethers.parseEther("1.0"), // 1 ETH 目标金额
        hre.ethers.parseEther("0.01"), // 0.01 ETH 每张券
        24 // 24小时
      );
      
      await tx.wait();
      console.log("✅ 示例项目创建成功 (项目ID: 1)");
    } catch (error) {
      console.log("❌ 创建示例项目失败:", error.message);
    }
  }
  
  console.log("\n🎉 部署完成！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
