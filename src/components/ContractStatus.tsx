import React from 'react'

interface ContractStatusProps {
  contractAddress: string
  isConnected: boolean
  contractsInitialized?: boolean
}

const ContractStatus: React.FC<ContractStatusProps> = ({ contractAddress, isConnected, contractsInitialized = false }) => {
  const isValidAddress = contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000'

  if (!isValidAddress) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              合约地址未配置
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                请在项目根目录创建 <code className="bg-red-100 px-1 rounded">.env.local</code> 文件，
                并添加合约地址：
              </p>
              <div className="mt-2 p-2 bg-red-100 rounded font-mono text-xs">
                VITE_CONTRACT_ADDRESS=0x744330366AAbCb72A1eF6b8fc585c5E6C94EE31c
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              钱包未连接
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>请连接您的 MetaMask 钱包来使用平台功能</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            {contractsInitialized ? '合约连接正常' : '钱包已连接'}
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>合约地址: <code className="bg-green-100 px-1 rounded font-mono">{contractAddress}</code></p>
            {contractsInitialized && (
              <p className="mt-1">✅ 智能合约已初始化</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractStatus
