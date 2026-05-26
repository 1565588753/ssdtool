import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Firmware, Tag } from '../../shared/types';
import { useAppStore } from '../store';
import {
  HardDrive,
  Download,
  Eye,
  Calendar,
  Zap
} from 'lucide-react';

interface FirmwareCardProps {
  firmware: Firmware;
  index: number;
}

export default function FirmwareCard({ firmware, index }: FirmwareCardProps) {
  const { tags } = useAppStore();
  
  // 获取固件的标签信息
  const firmwareTags = (firmware.tags || [])
    .map(tagId => tags.find(t => t.id === tagId))
    .filter(Boolean) as Tag[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl overflow-hidden group"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <Link to={`/firmware/${firmware.id}`} className="block p-6">
        <div className="flex items-start gap-4 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
            style={{ background: 'var(--theme-gradient)' }}
          >
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate" style={{ color: 'var(--theme-text)' }}>{firmware.title}</h3>
            <p className="text-sm line-clamp-2" style={{ color: 'var(--theme-text-secondary)' }}>{firmware.description}</p>
          </div>
        </div>

        {firmwareTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {firmwareTags.map(tag => (
              <span 
                key={tag.id}
                className="px-2 py-1 rounded-full text-xs"
                style={{ 
                  backgroundColor: tag.color ? `${tag.color}20` : 'var(--theme-bg-card)',
                  color: tag.color || 'var(--theme-primary-400)',
                  border: tag.color ? `1px solid ${tag.color}` : '1px solid var(--theme-border)'
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4" style={{ color: 'var(--theme-text-secondary)' }}>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{firmware.downloadCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(firmware.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-medium" style={{ color: 'var(--theme-primary-400)' }}>
            查看详情
            <Zap className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
