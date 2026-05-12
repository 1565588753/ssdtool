import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Firmware } from '../../shared/types';
import {
  HardDrive,
  Download,
  Eye,
  Calendar,
  Tag,
  Zap
} from 'lucide-react';

interface FirmwareCardProps {
  firmware: Firmware;
  index: number;
}

export default function FirmwareCard({ firmware, index }: FirmwareCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl overflow-hidden group"
    >
      <Link to={`/firmware/${firmware.id}`} className="block p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">{firmware.name}</h3>
            <p className="text-slate-400 text-sm line-clamp-2">{firmware.description}</p>
          </div>
          {firmware.isPaid && (
            <div className="flex-shrink-0">
              <div className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                ¥{firmware.price}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{firmware.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{firmware.downloads}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(firmware.uploadDate).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary-400 font-medium">
            查看详情
            <Zap className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {firmware.tags && firmware.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {firmware.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
