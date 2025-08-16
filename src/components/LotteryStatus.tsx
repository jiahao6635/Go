import React from 'react'
import { Project } from '../hooks/useContract'
import { formatMON } from '../utils/formatters'

interface LotteryStatusProps {
  project: Project
}

const LotteryStatus: React.FC<LotteryStatusProps> = ({ project }) => {
  const now = Math.floor(Date.now() / 1000)
  
  // 项目已抽奖完成
  if (project.isDrawn && project.winner !== '0x0000000000000000000000000000000000000000') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">🏆</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-2">抽奖已完成</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-green-700">中奖者：</span>
                <span className="font-mono text-green-800 bg-green-100 px-2 py-1 rounded">
                  {project.winner.slice(0, 8)}...{project.winner.slice(-6)}
                </span>
              </div>
              <div>
                <span className="text-green-700">奖金：</span>
                <span className="font-semibold text-green-800">
                  {formatMON(project.totalAmount * 98n / 100n)} MON
                </span>
                <span className="text-green-600 text-xs ml-1">(已扣除2%平台费)</span>
              </div>
              <div>
                <span className="text-green-700">参与人数：</span>
                <span className="font-medium text-green-800">{project.soldTickets} 人</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // 项目售罄待抽奖
  if (project.soldTickets >= project.maxTickets && !project.isDrawn) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">🎯</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">售罄待抽奖</h3>
            <div className="space-y-1 text-sm text-yellow-700">
              <p>所有抽奖券已售完！管理员将很快进行抽奖。</p>
              <div>
                <span>奖池金额：</span>
                <span className="font-semibold">{formatMON(project.totalAmount * 98n / 100n)} MON</span>
              </div>
              <div>
                <span>参与人数：</span>
                <span className="font-medium">{project.soldTickets} 人</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // 项目过期待处理
  if (now > project.deadline && !project.isDrawn && project.soldTickets > 0) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">⏰</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">项目已过期</h3>
            <div className="space-y-1 text-sm text-orange-700">
              <p>项目时间已到，管理员将决定是否进行抽奖或退款。</p>
              <div>
                <span>筹集金额：</span>
                <span className="font-semibold">{formatMON(project.currentAmount)} MON</span>
                <span className="ml-2">
                  ({Math.round(Number(project.currentAmount * 100n / project.totalAmount))}%)
                </span>
              </div>
              <div>
                <span>参与人数：</span>
                <span className="font-medium">{project.soldTickets} 人</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}

export default LotteryStatus
