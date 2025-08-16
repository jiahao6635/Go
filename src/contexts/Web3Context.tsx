import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

export interface Web3ContextType {
  account: string | null
  balance: string
  isConnected: boolean
  isConnecting: boolean
  contractsInitialized: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToMonadNetwork: () => Promise<void>
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// Monad测试网配置
const MONAD_TESTNET = {
  chainId: '0x279F', // 10143 转换为16进制
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'], 
  blockExplorerUrls: ['https://testnet.monadexplorer.com']
}

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0.0')
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [contractsInitialized, setContractsInitialized] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  // 防止重复调用的标志
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const [networkSwitching, setNetworkSwitching] = useState(false)

  // 检查是否已连接
  useEffect(() => {
    if (!initialCheckDone) {
      console.log('🔄 首次初始化钱包连接检查...')
      checkConnection()
      setInitialCheckDone(true)
    }
  }, [initialCheckDone])

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    console.log('🔍 检查钱包连接状态...')
    console.log('window.ethereum:', !!window.ethereum)
    console.log('ethereum.providers:', window.ethereum?.providers?.length || 0)
    
    const metamaskProvider = getMetaMaskProvider()
    
    if (!metamaskProvider) {
      console.log('❌ MetaMask未检测到')
      return
    }

    try {
      // 先检查是否已经连接
      console.log('📞 请求账户信息...')
      const accounts = await metamaskProvider.request({ 
        method: 'eth_accounts' 
      }).catch((error) => {
        console.error('❌ 获取账户失败:', error)
        // 如果出错，可能是多钱包冲突，静默处理
        return []
      })
      
      console.log('📋 账户列表:', accounts)
      
      if (accounts && accounts.length > 0) {
        try {
          console.log('🔗 设置提供者...')
          const provider = new ethers.BrowserProvider(metamaskProvider)
          setProvider(provider)
          
          const signer = await provider.getSigner()
          setSigner(signer)
          setAccount(accounts[0])
          setIsConnected(true)
          
          console.log('✅ 钱包连接状态恢复成功')
          await updateBalance(provider, accounts[0])
          
          // 初始化合约
          initializeContracts(provider, signer)
        } catch (error) {
          console.error('❌ 设置提供者失败:', error)
          // 如果设置提供者失败，清除连接状态
          setIsConnected(false)
          setAccount(null)
          setProvider(null)
          setSigner(null)
        }
      } else {
        console.log('ℹ️ 没有已连接的账户')
      }
    } catch (error) {
      console.error('❌ 检查连接状态失败:', error)
      // 静默处理错误，不显示给用户
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
      if (provider) {
        updateBalance(provider, accounts[0])
      }
    }
  }

  const handleChainChanged = () => {
    // 刷新页面以处理网络变化
    window.location.reload()
  }

  const updateBalance = async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const balance = await provider.getBalance(address)
      setBalance(ethers.formatEther(balance))
    } catch (error) {
      console.error('获取余额失败:', error)
    }
  }

  // 初始化合约服务
  const initializeContracts = async (provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) => {
    try {
      console.log('🔗 正在初始化合约服务...')
      
      // 检查网络是否为Monad测试网
      const network = await provider.getNetwork()
      if (network.chainId.toString() !== '10143') {
        console.warn('⚠️ 当前网络不是Monad测试网，合约可能无法正常工作')
        toast.error('建议切换到Monad测试网以获得最佳体验', { duration: 4000 })
      }

      setContractsInitialized(true)
      
      console.log('✅ 合约服务初始化成功')
      toast.success('智能合约已连接！', { duration: 2000 })
      
    } catch (error) {
      console.error('❌ 合约初始化失败:', error)
      setContractsInitialized(false)
      toast.error('合约初始化失败，部分功能可能不可用')
    }
  }

  const addMonadNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [MONAD_TESTNET]
      })
    } catch (error) {
      console.error('添加Monad测试网失败:', error)
      throw error
    }
  }

  const switchToMonadNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }]
      })
    } catch (error: any) {
      // 如果网络不存在，则添加
      if (error.code === 4902) {
        await addMonadNetwork()
      } else {
        throw error
      }
    }
  }

  const getMetaMaskProvider = () => {
    // 处理多钱包环境
    if (window.ethereum) {
      // 如果有多个钱包提供者
      if (window.ethereum.providers?.length > 0) {
        console.log('🔍 检测到多个钱包提供者:', window.ethereum.providers.length)
        // 寻找 MetaMask 提供者
        const metamaskProvider = window.ethereum.providers.find((provider: any) => provider.isMetaMask)
        if (metamaskProvider) {
          console.log('✅ 找到 MetaMask 提供者')
          return metamaskProvider
        }
      }
      
      // 检查单一提供者是否为 MetaMask
      if (window.ethereum.isMetaMask) {
        console.log('✅ 检测到 MetaMask（单一提供者）')
        return window.ethereum
      }
    }
    
    // 检查是否在 window 对象上有特定的 MetaMask 属性
    if (window.ethereum && window.ethereum._metamask) {
      console.log('✅ 通过 _metamask 属性检测到 MetaMask')
      return window.ethereum
    }

    return null
  }

  const connectWallet = async () => {
    console.log('🚀 开始连接钱包...')
    console.log('window.ethereum 存在:', !!window.ethereum)
    console.log('ethereum.providers:', window.ethereum?.providers?.length || 0)
    
    const metamaskProvider = getMetaMaskProvider()
    
    if (!metamaskProvider) {
      console.log('❌ 未检测到 MetaMask')
      if (!window.ethereum) {
        toast.error('请安装MetaMask钱包!')
        window.open('https://metamask.io/download.html', '_blank')
      } else {
        toast.error('检测到多个钱包，请确保MetaMask为默认钱包或禁用其他钱包扩展!')
      }
      return
    }

    console.log('✅ 使用 MetaMask 提供者连接')

    setIsConnecting(true)
    try {
      console.log('📞 请求账户访问权限...')
      
      // 使用检测到的 MetaMask 提供者请求连接
      const accounts = await metamaskProvider.request({
        method: 'eth_requestAccounts'
      }).catch((error: any) => {
        console.error('❌ 请求账户失败:', error)
        if (error.code === 4001) {
          throw new Error('用户拒绝了连接请求')
        } else if (error.code === -32002) {
          throw new Error('MetaMask正在处理中，请稍等...')
        } else if (error.message && error.message.includes('request')) {
          throw new Error('多钱包冲突，请禁用其他钱包扩展后重试')
        } else {
          throw new Error(`连接失败 (代码: ${error.code}): ${error.message}`)
        }
      })

      console.log('📋 获取到账户:', accounts)

      if (accounts && accounts.length > 0) {
        console.log('🔗 创建以太坊提供者...')
        // 使用特定的 MetaMask 提供者创建连接
        const provider = new ethers.BrowserProvider(metamaskProvider)
        setProvider(provider)
        
        try {
          console.log('✍️ 获取签名器...')
          const signer = await provider.getSigner()
          setSigner(signer)
          setAccount(accounts[0])
          setIsConnected(true)
          
          console.log('💰 获取余额...')
          await updateBalance(provider, accounts[0])
          
          console.log('🔗 初始化合约服务...')
          await initializeContracts(provider, signer)
          
          console.log('✅ 钱包连接完成!')
          toast.success('钱包连接成功!')
          
          // 检查当前网络，如果不是Monad测试网则提示切换（不强制）
          try {
            const network = await provider.getNetwork()
            console.log('🌐 当前网络:', network.chainId.toString(), network.name)
            
            if (network.chainId.toString() !== '10143' && !networkSwitching) { // Monad Testnet chainId
              console.log('⚠️ 当前网络不是Monad测试网，尝试自动切换...')
              setNetworkSwitching(true)
              
              // 延迟1秒后自动尝试切换网络
              setTimeout(async () => {
                try {
                  await switchToMonadNetwork()
                  toast.success('已成功切换到Monad测试网！', { duration: 3000 })
                  console.log('✅ 成功切换到Monad测试网')
                } catch (switchError: any) {
                  console.error('自动切换网络失败:', switchError)
                  
                  // 如果自动切换失败，显示手动切换提示
                  toast.error('请手动切换到Monad测试网以获得完整体验', { duration: 8000 })
                } finally {
                  // 3秒后重置网络切换状态，允许重试
                  setTimeout(() => setNetworkSwitching(false), 3000)
                }
              }, 1500)
            } else {
              console.log('✅ 已在 Monad 测试网')
            }
          } catch (networkError) {
            console.error('⚠️ 网络检查失败:', networkError)
          }
          
        } catch (signerError) {
          console.error('❌ 获取签名器失败:', signerError)
          toast.error('连接钱包失败，请确保MetaMask已解锁')
          throw signerError
        }
      } else {
        throw new Error('未获取到钱包账户')
      }
    } catch (error: any) {
      console.error('❌ 连接钱包失败:', error)
      toast.error(error.message || '连接钱包失败，请重试')
      
      // 清理状态
      setIsConnected(false)
      setAccount(null)
      setProvider(null)
      setSigner(null)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setContractsInitialized(false)
    
    setAccount(null)
    setBalance('0.0')
    setIsConnected(false)
    setProvider(null)
    setSigner(null)
    toast.success('钱包已断开连接')
  }

  const value: Web3ContextType = {
    account,
    balance,
    isConnected,
    isConnecting,
    contractsInitialized,
    connectWallet,
    disconnectWallet,
    switchToMonadNetwork,
    provider,
    signer
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// 声明全局类型
declare global {
  interface Window {
    ethereum?: any
  }
}