import React from 'react'
import { useContract } from '../hooks/useContract'
import { useWeb3 } from '../contexts/Web3Context'

const ContractDebugInfo: React.FC = () => {
  const { contract, contractAddress, isConnected: contractConnected } = useContract()
  const { isConnected, provider, account } = useWeb3()

  return (
    <div className="fixed bottom-6 right-6 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">🔍 调试信息</h3>
      <div className="text-xs space-y-1 text-gray-600">
        <div>
          <span className="font-medium">钱包状态:</span>
          <span className={`ml-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? '已连接' : '未连接'}
          </span>
        </div>
        <div>
          <span className="font-medium">合约状态:</span>
          <span className={`ml-2 ${contract ? 'text-green-600' : 'text-red-600'}`}>
            {contract ? '已连接' : '未连接'}
          </span>
        </div>
        <div>
          <span className="font-medium">合约地址:</span>
          <div className="font-mono text-xs mt-1 break-all">
            {contractAddress || '未配置'}
          </div>
        </div>
        <div>
          <span className="font-medium">账户地址:</span>
          <div className="font-mono text-xs mt-1 break-all">
            {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : '无'}
          </div>
        </div>
        <div>
          <span className="font-medium">Provider:</span>
          <span className="ml-2 text-xs">
            {provider?.constructor?.name || '无'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ContractDebugInfo
