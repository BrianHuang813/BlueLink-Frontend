import React from 'react';
import { Link } from 'react-router-dom';
import { Bond } from '../types';

interface ProjectCardProps {
  project: Bond;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const totalAmount = project.total_amount / 1000000000; // Convert MIST to SUI
  const amountRaised = project.amount_raised / 1000000000; // Convert MIST to SUI
  const progressPercentage = totalAmount > 0 ? (amountRaised / totalAmount) * 100 : 0;
  const interestRate = (project.annual_interest_rate / 100).toFixed(2); // Convert basis points to percentage

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {project.bond_image_url && (
        <img 
          src={project.bond_image_url} 
          alt={project.bond_name} 
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="mb-2">
          <h3 className="text-xl font-bold text-gray-800">{project.bond_name}</h3>
          <p className="text-sm text-gray-600">{project.issuer_name}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-xs text-gray-600">年利率</p>
            <p className="font-bold text-blue-600">{interestRate}%</p>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <p className="text-xs text-gray-600">到期日</p>
            <p className="font-bold text-green-600 text-sm">
              {new Date(project.maturity_date).toLocaleDateString('zh-TW', { 
                year: 'numeric', 
                month: 'short' 
              })}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>募集進度</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">已募集</p>
            <p className="font-bold text-lg">{amountRaised.toFixed(2)} SUI</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">募集總額</p>
            <p className="font-bold text-lg">{totalAmount.toFixed(2)} SUI</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">代幣數</p>
            <p className="font-bold text-lg">{project.tokens_issued}</p>
          </div>
        </div>

        <Link 
          to={`/project/${project.id}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center"
        >
          查看詳情
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
