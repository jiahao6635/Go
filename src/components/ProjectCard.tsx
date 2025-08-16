import React from 'react'
import { Link } from 'react-router-dom'
import { Project } from '../hooks/useContract'
import { formatMON, formatTimeRemaining, calculateProgress } from '../utils/formatters'

interface ProjectCardProps {
  project: Project
  className?: string
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, className = "" }) => {
  const getProjectStatus = (project: Project) => {
    const now = Math.floor(Date.now() / 1000)
    if (project.isCompleted) {
      return { text: '已完成', color: 'success', bgColor: 'bg-green-100', textColor: 'text-green-800' }
    }
    if (now > project.deadline) {
      return { text: '已过期', color: 'danger', bgColor: 'bg-red-100', textColor: 'text-red-800' }
    }
    return { text: '进行中', color: 'primary', bgColor: 'bg-blue-100', textColor: 'text-blue-800' }
  }

  const status = getProjectStatus(project)
  const progress = calculateProgress(project.currentAmount, project.totalAmount)
  const remainingTickets = project.maxTickets - project.soldTickets

  return (
    <div className={`card hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${className}`}>
      {/* Project Image */}
      <div className="relative">
        <img
          src={project.imageUrl || '/placeholder-image.jpg'}
          alt={project.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://via.placeholder.com/400x200?text=GO+Project'
          }}
        />
        <div className={`absolute top-3 right-3 badge ${status.bgColor} ${status.textColor} font-medium`}>
          {status.text}
        </div>
        {project.isCompleted && project.isDrawn && (
          <div className="absolute top-3 left-3 badge bg-purple-100 text-purple-800 font-medium">
            🎉 已开奖
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {project.name}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">进度: {progress}%</span>
          <span>{formatMON(project.currentAmount)} / {formatMON(project.totalAmount)} MON</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progress >= 100 ? 'bg-green-500' : progress >= 80 ? 'bg-yellow-500' : 'bg-primary-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="font-semibold text-gray-900">{project.soldTickets}</div>
          <div className="text-gray-500">已售券数</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="font-semibold text-gray-900">{remainingTickets}</div>
          <div className="text-gray-500">剩余券数</div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <span className="mr-1">⏰</span>
          <span>{formatTimeRemaining(project.deadline)}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">💰</span>
          <span>{formatMON(project.ticketPrice)} MON/张</span>
        </div>
      </div>

      {/* Action Button */}
      <Link
        to={`/project/${project.id}`}
        className="btn btn-primary w-full text-center inline-block hover:bg-primary-600 transition-colors"
      >
        {project.isCompleted ? '查看结果' : '立即参与'}
      </Link>
    </div>
  )
}

export default ProjectCard
