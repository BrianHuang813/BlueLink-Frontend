import React, { useState, useEffect } from 'react';
import { bondService } from '../services/api';
import { Bond } from '../types';
import ProjectCard from '../components/ProjectCard';

const HomePage: React.FC = () => {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBonds = async () => {
      try {
        const bondsData = await bondService.getAllBonds();
        setBonds(bondsData);
      } catch (err) {
        setError('無法載入債券列表');
        console.error('Error fetching bonds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBonds();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">正在載入債券...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          透明的藍色債券平台
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          使用區塊鏈技術確保資金流向透明，讓每一筆投資都能被追蹤，支持真正有意義的海洋保育和藍色經濟項目。
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          探索藍色債券 ({bonds.length})
        </h2>
        <div className="text-sm text-gray-600">
          所有數據來自 Sui 區塊鏈
        </div>
      </div>

      {bonds.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            目前還沒有債券
          </h3>
          <p className="text-gray-600 mb-6">
            成為第一個建立藍色債券的人！
          </p>
          <a 
            href="/create" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            建立債券
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonds.map((bond) => (
            <ProjectCard key={bond.on_chain_id} project={bond} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
