import React from 'react'
import { Project } from '../hooks/useContract'
import { formatMON } from '../utils/formatters'

interface FundFlowDiagramProps {
  project: Project
}

const FundFlowDiagram: React.FC<FundFlowDiagramProps> = ({ project }) => {
  const totalFunds = project.currentAmount
  const platformFee = totalFunds * 2n / 100n  // 2% 平台费
  const winnerPrize = totalFunds - platformFee  // 98% 给获奖者

  const isCompleted = project.isDrawn && project.winner !== '0x0000000000000000000000000000000000000000'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 资金流向</h3>
      
      {/* 总资金池 */}
      <div className="text-center mb-6">
        <div className="inline-block bg-blue-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800 mb-1">
            {formatMON(totalFunds)} MON
          </div>
          <div className="text-sm text-blue-600">众筹资金池</div>
          <div className="text-xs text-gray-500 mt-1">
            {project.soldTickets} 人参与 • {project.maxTickets} 张券
          </div>
        </div>
      </div>

      {/* 资金分配箭头图 */}
      <div className="space-y-4">
        {/* 获奖者部分 */}
        <div className="flex items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">获奖者奖金 (98%)</div>
                <div className="text-lg font-bold text-green-600">
                  {formatMON(winnerPrize)} MON
                </div>
                {isCompleted && (
                  <div className="text-xs text-gray-600 mt-1">
                    ✅ 已转账至：{project.winner.slice(0, 10)}...{project.winner.slice(-8)}
                  </div>
                )}
                {!isCompleted && (
                  <div className="text-xs text-orange-600 mt-1">
                    ⏳ 等待抽奖完成后自动转账
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 ml-7">
              <div className="bg-green-50 rounded p-3">
                <div className="text-xs text-green-700">
                  <div className="flex items-center mb-1">
                    <span className="font-medium">💡 转账机制：</span>
                  </div>
                  <ul className="text-xs space-y-1 text-green-600">
                    <li>• 抽奖完成后立即自动转账</li>
                    <li>• 直接转入获奖者钱包地址</li>
                    <li>• 无需手动提取，即刻到账</li>
                    <li>• 转账失败会回滚整个抽奖</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isCompleted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {isCompleted ? '已完成' : '等待中'}
            </div>
          </div>
        </div>

        {/* 平台费用部分 */}
        <div className="flex items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">平台手续费 (2%)</div>
                <div className="text-lg font-bold text-gray-600">
                  {formatMON(platformFee)} MON
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  用于平台运营和维护
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              平台收益
            </div>
          </div>
        </div>
      </div>

      {/* 重要提醒 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-500 mr-2">ℹ️</div>
          <div className="text-sm">
            <div className="font-medium text-blue-900 mb-1">资金安全保证</div>
            <div className="text-blue-700 space-y-1">
              <div>• 所有资金操作在智能合约中自动执行</div>
              <div>• 获奖者资金在抽奖瞬间自动转账</div>
              <div>• 平台无法控制或截留用户资金</div>
              <div>• 所有交易记录可在区块链上公开查询</div>
            </div>
          </div>
        </div>
      </div>

      {/* 交易状态 */}
      {isCompleted && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm">
            <div className="font-medium text-green-900 mb-2">🎉 转账已完成</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-green-700">获奖者:</span>
                <div className="font-mono text-green-800 mt-1 break-all">
                  {project.winner}
                </div>
              </div>
              <div>
                <span className="text-green-700">实际到账:</span>
                <div className="font-bold text-green-800 mt-1">
                  {formatMON(winnerPrize)} MON
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 合约代码引用 */}
      <details className="mt-4">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          📋 查看合约转账代码
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
          <div className="text-gray-600 mb-2">// 智能合约自动执行的转账逻辑</div>
          <div className="text-green-600">uint256 platformFee = totalAmount * 2 / 100;</div>
          <div className="text-blue-600">uint256 prizeAmount = totalAmount - platformFee;</div>
          <div className="text-red-600 mt-1">payable(winner).call&#123;value: prizeAmount&#125;("");</div>
          <div className="text-gray-600 mt-1">require(success, "Prize transfer failed");</div>
        </div>
      </details>
    </div>
  )
}

export default FundFlowDiagram
