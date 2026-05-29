import { useState } from 'react';
import { useAppStore } from '../../store';
import { adminAPI } from '../../services/api';
import { themes } from '../../hooks/useTheme';
import {
  Globe,
  Zap,
  Settings,
  FileText,
  Users,
  Palette,
  Plus,
  Trash2,
  CheckCircle,
  Mail,
  ShieldAlert,
  TriangleAlert
} from 'lucide-react';

export default function SiteSettings({ setTheme, currentTheme }: { setTheme: (themeId: string) => void; currentTheme: string }) {
  const { config, updateSiteSettings, updateHomeModule, updateModuleOrder, updateAdSlot, addAdSlot, deleteAdSlot, updateQuotaSettings } = useAppStore();
const [activeSection, setActiveSection] = useState<'basic' | 'modules' | 'ads' | 'homeText' | 'quota' | 'theme' | 'smtp' | 'storage' | 'maintenance'>('basic');

  const sections = [
    { id: 'basic', icon: Globe, label: '基本设置' },
    { id: 'modules', icon: Zap, label: '模块管理' },
    { id: 'ads', icon: Settings, label: '广告位管理' },
    { id: 'homeText', icon: FileText, label: '首页文本' },
    { id: 'quota', icon: Users, label: '下载配额' },
    { id: 'smtp', icon: Mail, label: 'SMTP设置' },
    { id: 'theme', icon: Palette, label: '主题配色' },
    { id: 'maintenance', icon: ShieldAlert, label: '维护模式' }
  ];

  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '',
    user: '',
    pass: '',
    fromEmail: '',
    fromName: ''
  });
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpMessage, setSmtpMessage] = useState('');
  const [smtpLoaded, setSmtpLoaded] = useState(false);

  const loadSmtpConfig = async () => {
    try {
      const res = await adminAPI.getSmtpConfig();
      if (res.success && res.config) {
        setSmtpConfig({
          host: res.config.host || '',
          port: res.config.port?.toString() || '',
          user: res.config.user || '',
          pass: res.config.pass || '',
          fromEmail: res.config.fromEmail || '',
          fromName: res.config.fromName || ''
        });
      }
    } catch (err) {
      console.error('加载SMTP配置失败:', err);
    }
  };

  if (activeSection === 'smtp' && !smtpLoaded) {
    setSmtpLoaded(true);
    loadSmtpConfig();
  }

  const sortedModules = [...config.homeModules].sort((a, b) => a.order - b.order);

  const handleDragStart = (id: string) => {
    setDraggedModuleId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedModuleId || draggedModuleId === targetId) return;

    const updatedModules = [...sortedModules];
    const draggedIndex = updatedModules.findIndex(m => m.id === draggedModuleId);
    const targetIndex = updatedModules.findIndex(m => m.id === targetId);

    const [draggedModule] = updatedModules.splice(draggedIndex, 1);
    updatedModules.splice(targetIndex, 0, draggedModule);

    updatedModules.forEach((module, index) => {
      updateHomeModule(module.id, { order: index + 1 });
    });

    updateModuleOrder(updatedModules.map(m => m.id));
    setDraggedModuleId(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>网站设置</h2>

      <div className="glass-card rounded-xl overflow-hidden" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="grid md:grid-cols-4 divide-x" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="p-4 space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'text-white'
                      : 'hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--theme-bg-hover)' : 'transparent',
                    color: isActive ? 'var(--theme-text)' : 'var(--theme-text-secondary)'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-3 p-6">
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>网站名称</label>
                  <input
                    type="text"
                    value={config.siteSettings.name}
                    onChange={(e) => updateSiteSettings({ name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>网站描述</label>
                  <textarea
                    value={config.siteSettings.description}
                    onChange={(e) => updateSiteSettings({ description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
<div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>版权信息</label>
                  <input
                    type="text"
                    value={config.siteSettings.copyright || ''}
                    onChange={(e) => updateSiteSettings({ copyright: e.target.value })}
                    placeholder="例如 © 2024 我的网站. All rights reserved."
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                  <p className="text-xs mt-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                    留空则显示默认版权文字
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'modules' && (
              <div className="space-y-4">
                <p className="text-sm mb-4" style={{ color: 'var(--theme-text-secondary)' }}>拖拽排序模块，启用/禁用模块</p>
                {sortedModules.map((module) => (
                  <div
                    key={module.id}
                    draggable
                    onDragStart={() => handleDragStart(module.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(module.id)}
                    className={`p-4 border rounded-xl hover:bg-white/5 transition-colors ${
                      draggedModuleId === module.id ? 'opacity-50' : ''
                    }`}
                    style={{
                      borderColor: 'var(--theme-border)',
                      backgroundColor: 'var(--theme-bg-hover)',
                      cursor: 'move'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="6" r="1" />
                            <circle cx="15" cy="6" r="1" />
                            <circle cx="9" cy="12" r="1" />
                            <circle cx="15" cy="12" r="1" />
                            <circle cx="9" cy="18" r="1" />
                            <circle cx="15" cy="18" r="1" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{module.name}</p>
                          {module.title && (
                            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{module.title}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={module.enabled}
                            onChange={(e) => updateHomeModule(module.id, { enabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" style={{ backgroundColor: 'var(--theme-bg-card)' }}></div>
                        </label>
                      </div>
                    </div>
                    {(module.id === 'hot' || module.id === 'latest' || module.id === 'donations' || module.id === 'contributors') && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>自定义标题</label>
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) => updateHomeModule(module.id, { title: e.target.value })}
                            placeholder="标题"
                            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                            style={{
                              backgroundColor: 'var(--theme-bg-card)',
                              border: '1px solid var(--theme-border)',
                              color: 'var(--theme-text)'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>自定义描述</label>
                          <input
                            type="text"
                            value={module.description}
                            onChange={(e) => updateHomeModule(module.id, { description: e.target.value })}
                            placeholder="描述"
                            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                            style={{
                              backgroundColor: 'var(--theme-bg-card)',
                              border: '1px solid var(--theme-border)',
                              color: 'var(--theme-text)'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'ads' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>管理广告位内容和位置</p>
                  <button
                    onClick={() => addAdSlot({ name: '新广告位', enabled: false, content: '', position: 'custom' })}
                    className="btn-primary px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加广告位
                  </button>
                </div>
                {config.adSlots.map((slot) => (
                  <div key={slot.id} className="p-4 border rounded-xl hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-hover)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{slot.name}</p>
                        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>位置: {slot.position}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={slot.enabled}
                            onChange={(e) => updateAdSlot(slot.id, { enabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" style={{ backgroundColor: 'var(--theme-bg-card)' }}></div>
                        </label>
                        <button onClick={() => deleteAdSlot(slot.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>广告名称</label>
                        <input
                          type="text"
                          value={slot.name}
                          onChange={(e) => updateAdSlot(slot.id, { name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                          style={{
                            backgroundColor: 'var(--theme-bg-card)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text)'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>位置</label>
                        <input
                          type="text"
                          value={slot.position}
                          onChange={(e) => updateAdSlot(slot.id, { position: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                          style={{
                            backgroundColor: 'var(--theme-bg-card)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text)'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>广告内容</label>
                        <textarea
                          value={slot.content}
                          onChange={(e) => updateAdSlot(slot.id, { content: e.target.value })}
                          rows={3}
                          placeholder="支持 HTML 内容"
                          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                          style={{
                            backgroundColor: 'var(--theme-bg-card)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'homeText' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>首页标题</label>
                  <input
                    type="text"
                    value={config.siteSettings.name}
                    onChange={(e) => updateSiteSettings({ name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>首页副标题</label>
                  <textarea
                    value={config.siteSettings.description}
                    onChange={(e) => updateSiteSettings({ description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
              </div>
            )}

            {activeSection === 'quota' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>免费用户每月下载次数</label>
                  <input
                    type="number"
                    value={config.quotaSettings.freeQuota}
                    onChange={(e) => updateQuotaSettings({ freeQuota: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>Premium 用户每月下载次数</label>
                  <input
                    type="number"
                    value={config.quotaSettings.premiumQuota}
                    onChange={(e) => updateQuotaSettings({ premiumQuota: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>Premium 价格</label>
                  <input
                    type="number"
                    value={config.quotaSettings.premiumPrice}
                    onChange={(e) => updateQuotaSettings({ premiumPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
              </div>
            )}

            {activeSection === 'smtp' && (
              <div className="space-y-6">
                <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>配置邮件服务器用于发送验证码等系统邮件</p>
                {smtpMessage && (
                  <div className={`p-4 rounded-xl text-sm ${
                    smtpMessage.startsWith('保存成功') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {smtpMessage}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>SMTP 服务器</label>
                  <input
                    type="text"
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    placeholder="smtp.example.com"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>端口</label>
                  <input
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                    placeholder="465"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>用户名</label>
                  <input
                    type="text"
                    value={smtpConfig.user}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>密码</label>
                  <input
                    type="password"
                    value={smtpConfig.pass}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                    placeholder="请输入密码"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>发件人邮箱</label>
                  <input
                    type="email"
                    value={smtpConfig.fromEmail}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                    placeholder="noreply@example.com"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>发件人名称</label>
                  <input
                    type="text"
                    value={smtpConfig.fromName}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                    placeholder="SSD开卡工具站"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <button
                  onClick={async () => {
                    setSmtpSaving(true);
                    setSmtpMessage('');
                    try {
                      const res = await adminAPI.updateSmtpConfig({
                        host: smtpConfig.host,
                        port: Number(smtpConfig.port),
                        user: smtpConfig.user,
                        pass: smtpConfig.pass,
                        fromEmail: smtpConfig.fromEmail,
                        fromName: smtpConfig.fromName
                      });
                      if (res.success) {
                        setSmtpMessage('保存成功');
                      } else {
                        setSmtpMessage('保存失败');
                      }
                    } catch (err: any) {
                      setSmtpMessage(err.message || '保存失败');
                    } finally {
                      setSmtpSaving(false);
                    }
                  }}
                  disabled={smtpSaving}
                  className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  {smtpSaving ? '保存中...' : '保存配置'}
                </button>
              </div>
            )}

{activeSection === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-4" style={{ color: 'var(--theme-text-secondary)' }}>选择主题</label>
                  <div className="grid grid-cols-4 gap-4">
                    {themes.map((theme) => {
                      const isActive = currentTheme === theme.id;
                      return (
                        <div key={theme.id} className="text-center cursor-pointer" onClick={() => setTheme(theme.id)}>
                          <div
                            className="w-full aspect-square rounded-xl shadow-lg hover:scale-105 transition-transform border-2 flex items-center justify-center"
                            style={{
                              background: theme.gradient,
                              borderColor: isActive ? theme.primary[500] : 'transparent'
                            }}
                          >
                            {isActive && <CheckCircle className="w-6 h-6 text-white drop-shadow-lg" />}
                          </div>
                          <p className="text-xs mt-2" style={{ color: 'var(--theme-text-secondary)' }}>{theme.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'maintenance' && (
              <MaintenanceSettings />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintenanceSettings() {
  const { config, updateMaintenanceSettings } = useAppStore();
  const [enabled, setEnabled] = useState(config.maintenanceSettings?.enabled || false);
  const [message, setMessage] = useState(config.maintenanceSettings?.message || '网站维护中，敬请期待...');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await adminAPI.updateConfig({
        maintenanceSettings: { enabled, message }
      });
      if (res.success) {
        updateMaintenanceSettings({ enabled, message });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      console.error('保存维护模式设置失败:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--theme-gradient)' }}>
          <TriangleAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold" style={{ color: 'var(--theme-text)' }}>维护模式</h3>
          <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            开启后，只有管理员可以访问网站，其他用户将看到维护提示
          </p>
        </div>
      </div>

      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-medium" style={{ color: 'var(--theme-text)' }}>维护模式</p>
            <p className="text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
              {enabled ? '网站当前处于维护状态，仅管理员可访问' : '网站正常运行中'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500" style={{ backgroundColor: enabled ? '#f59e0b' : 'var(--theme-bg-hover)' }}></div>
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
            维护提示信息
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
            style={{
              backgroundColor: 'var(--theme-bg-base)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text)'
            }}
            placeholder="网站维护中，敬请期待..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--theme-gradient)' }}
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
          {saved && (
            <span className="text-sm font-medium text-green-400">设置已保存</span>
          )}
        </div>
      </div>
    </div>
  );
}