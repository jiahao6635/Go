import React from 'react'
import { useWeb3 } from '../contexts/Web3Context'

const NetworkStatus: React.FC = () => {
  const { isConnected, contractsInitialized, switchToMonadNetwork } = useWeb3()

  if (!isConnected) {
    return null // 如果钱包未连接，不显示网络状态
  }

  if (!contractsInitialized) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-yellow-800">
              请切换到 Monad 测试网
            </span>
          </div>
          <button
            onClick={switchToMonadNetwork}
            className="text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded transition-colors"
          >
            切换网络
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
        <span className="text-sm font-medium text-green-800">
          ✅ 已连接到 Monad 测试网
        </span>
      </div>
    </div>
  )
}

export default NetworkStatus
