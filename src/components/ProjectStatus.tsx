import React, { useState, useEffect } from 'react'
import { useContract, Project } from '../hooks/useContract'
import { formatMON } from '../utils/formatters'
import FundFlowDiagram from './FundFlowDiagram'
import toast from 'react-hot-toast'

interface ProjectStatusProps {
  project: Project
  onProjectUpdate?: () => void
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ project, onProjectUpdate }) => {
  const { drawLottery } = useContract()
  const [drawing, setDrawing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // 模拟检查项目是否真的完成了抽奖
  const checkProjectStatus = async () => {
    console.log('🔍 项目状态检查:')
    console.log('  - 项目ID:', project.id)
    console.log('  - 已售券数:', project.soldTickets)
    console.log('  - 最大券数:', project.maxTickets)
    console.log('  - 是否完成:', project.isCompleted)
    console.log('  - 是否抽奖:', project.isDrawn)
    console.log('  - 获奖者:', project.winner)
    console.log('  - 当前金额:', formatMON(project.currentAmount))
    console.log('  - 目标金额:', formatMON(project.totalAmount))
    
    const progress = Number(project.currentAmount * 100n / project.totalAmount)
    console.log('  - 进度:', progress + '%')
  }

  useEffect(() => {
    checkProjectStatus()
  }, [project])

  const handleManualDraw = async () => {
    setDrawing(true)
    try {
      await drawLottery(project.id)
      toast.success('🎉 手动抽奖成功！')
      onProjectUpdate?.()
    } catch (error: any) {
      console.error('手动抽奖失败:', error)
      toast.error('抽奖失败：' + error.message)
    } finally {
      setDrawing(false)
    }
  }

  const getStatusInfo = () => {
    const now = Math.floor(Date.now() / 1000)
    const isExpired = now > project.deadline
    const isSoldOut = project.soldTickets >= project.maxTickets
    const progress = Number(project.currentAmount * 100n / project.totalAmount)
    
    if (project.isDrawn && project.winner !== '0x0000000000000000000000000000000000000000') {
      return {
        status: 'completed',
        title: '🏆 抽奖已完成',
        color: 'green',
        bgColor: 'bg-green-50 border-green-200',
        message: `获奖者已确定，奖金已发放`
      }
    }
    
    if (project.isCompleted && !project.isDrawn) {
      return {
        status: 'ready_to_draw',
        title: '🎯 等待抽奖',
        color: 'yellow',
        bgColor: 'bg-yellow-50 border-yellow-200',
        message: `项目已完成，等待抽奖`
      }
    }
    
    if (isSoldOut && !project.isCompleted) {
      return {
        status: 'sold_out_but_not_completed',
        title: '⚠️ 异常状态',
        color: 'red',
        bgColor: 'bg-red-50 border-red-200',
        message: `券已售罄但项目未标记完成`
      }
    }
    
    if (progress >= 100 && !project.isCompleted) {
      return {
        status: 'target_reached_but_not_completed',
        title: '⚠️ 异常状态',
        color: 'red',
        bgColor: 'bg-red-50 border-red-200',
        message: `已达目标金额但项目未完成`
      }
    }
    
    if (isExpired && !project.isCompleted) {
      return {
        status: 'expired',
        title: '⏰ 项目过期',
        color: 'orange',
        bgColor: 'bg-orange-50 border-orange-200',
        message: `项目已过期，需要退款或手动抽奖`
      }
    }
    
    return {
      status: 'active',
      title: '📈 进行中',
      color: 'blue',
      bgColor: 'bg-blue-50 border-blue-200',
      message: `进度 ${progress.toFixed(1)}%，还需 ${formatMON(project.totalAmount - project.currentAmount)} MON`
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className={`border rounded-lg p-4 ${statusInfo.bgColor}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900">{statusInfo.title}</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showDetails ? '隐藏' : '详情'}
        </button>
      </div>
      
      <p className="text-sm text-gray-700 mb-3">{statusInfo.message}</p>
      
      {/* 资金流向图表 */}
      <div className="mb-3">
        <FundFlowDiagram project={project} />
      </div>
      
      {/* 详细状态信息 */}
      {showDetails && (
        <div className="bg-white rounded-lg p-3 text-xs space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">项目状态：</span>
              <span className={`font-medium ${
                project.isCompleted ? 'text-green-600' : 'text-orange-600'
              }`}>
                {project.isCompleted ? '已完成' : '进行中'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">抽奖状态：</span>
              <span className={`font-medium ${
                project.isDrawn ? 'text-green-600' : 'text-gray-600'
              }`}>
                {project.isDrawn ? '已抽奖' : '未抽奖'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">售出券数：</span>
              <span className="font-medium">{project.soldTickets}/{project.maxTickets}</span>
            </div>
            <div>
              <span className="text-gray-500">筹集金额：</span>
              <span className="font-medium">{formatMON(project.currentAmount)} MON</span>
            </div>
          </div>
          
          {/* 管理员操作 */}
          {statusInfo.status === 'ready_to_draw' && (
            <div className="pt-2 border-t">
              <button
                onClick={handleManualDraw}
                disabled={drawing}
                className="btn btn-primary btn-sm w-full"
              >
                {drawing ? '抽奖中...' : '🎲 立即抽奖'}
              </button>
            </div>
          )}
          
          {/* 异常状态提醒 */}
          {(statusInfo.status === 'sold_out_but_not_completed' || 
            statusInfo.status === 'target_reached_but_not_completed') && (
            <div className="pt-2 border-t">
              <p className="text-red-600 text-xs mb-2">
                ⚠️ 检测到异常状态，可能需要管理员介入
              </p>
              <button
                onClick={handleManualDraw}
                disabled={drawing}
                className="btn btn-warning btn-sm w-full"
              >
                {drawing ? '处理中...' : '🔧 尝试修复'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectStatus
