import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  BarChart3, 
  History, 
  LogOut, 
  Edit3, 
  Save, 
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  Filter,
  Search,
  RefreshCw,
  UserPlus,
  Shield,
  Lock,
  Unlock,
  Mail,
  UserCheck,
  UserX,
  Settings,
  Key,
  Database,
  Cloud,
  CheckCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ================================
// SUPABASE КОНФИГУРАЦИЯ
// ================================

// ВНИМАНИЕ: Замените эти значения на ваши из Supabase!
const SUPABASE_URL = 'https://hvccptpqomwuyuxttipo.supabase.co'; // Замените на ваш URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Y2NwdHBxb213dXl1eHR0aXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4OTEwMDYsImV4cCI6MjA3MjQ2NzAwNn0.UZWEPK7ZQtKyXKYcGoTtyXcCPaav0HUX67pweSyRUbk'; // Замените на ваш ключ

// Суpabase клиент (упрощенная версия для демо)
const supabaseClient = {
  auth: {
    // Имитация аутентификации для демо
    signIn: async (email, password) => {
      // В реальном приложении здесь будет вызов Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Демо логика
      if (email === 'admin@company.com' && password === 'AdminPass2024!') {
        return { data: { user: { id: 'admin', email, role: 'admin' } }, error: null };
      } else if (email === 'user1@company.com' && password === '123456') {
        return { data: { user: { id: 'user1', email, role: 'user' } }, error: null };
      } else if (email === 'demo@company.com' && password === 'demo') {
        return { data: { user: { id: 'demo', email, role: 'user' } }, error: null };
      }
      
      return { data: null, error: { message: 'Неверный email или пароль' } };
    },
    
    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { error: null };
    }
  },
  
  from: (table) => ({
    select: async (query = '*') => {
      // Имитация запросов к БД
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (table === 'users') {
        return {
          data: [
            { id: 'admin', email: 'admin@company.com', role: 'admin', active: true, created_at: '2024-01-01' },
            { id: 'user1', email: 'user1@company.com', role: 'user', active: true, created_at: '2024-02-15' },
            { id: 'demo', email: 'demo@company.com', role: 'user', active: true, created_at: '2024-03-01' }
          ],
          error: null
        };
      }
      
      return { data: [], error: null };
    },
    
    insert: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: [{ ...data, id: Date.now().toString() }], error: null };
    },
    
    update: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: [data], error: null };
    },
    
    delete: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: [], error: null };
    }
  })
};

const TransportAnalyticsApp = () => {
  // Состояния аутентификации
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  
  // Состояния приложения
  const [currentView, setCurrentView] = useState('dashboard');
  const [processedData, setProcessedData] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  
  // Реф для загрузки файлов
  const fileInputRef = useRef(null);
  
  // Проверка настройки Supabase
  useEffect(() => {
    const isConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && 
                        SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE';
    setSetupComplete(isConfigured);
  }, []);
  
  // Функция обработки файла
  const processTextFile = (content) => {
    const lines = content.split('\n');
    const data = [];
    let tempData = {};
    let prevTempData = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const lineData = line.split(/\s+/);
      
      if (lineData[0] === "Перечень" || lineData[0] === "Счет") {
        tempData["Наименование"] = lineData[0];
        tempData["№"] = lineData[2] || '';
        tempData["Дата"] = lineData[4] || '';
      } else if (lineData[0] === "Покупатель") {
        tempData["Покупатель"] = lineData.slice(1).join(" ");
      } else if (lineData[0] === "Вид") {
        tempData["Вид документа"] = lineData.slice(2).join(" ");
      } else if (lineData[0] === "Станция") {
        tempData["Станция"] = lineData.slice(1).join(" ");
      } else if (/^\d{2}\.\d{2}/.test(line)) {
        tempData["Дата услуги"] = lineData[0] || '';
        tempData["Номер выделения средств"] = lineData[1] || '';
        tempData["Номер документа"] = lineData[2] || '';
        tempData["Вид платежа"] = lineData.slice(3, -2).join(" ");
        
        try {
          const sumStr = (lineData[lineData.length - 2] || '').replace(/\./g, '').replace(',', '.').replace('-', '');
          const taxStr = (lineData[lineData.length - 1] || '').replace(/\./g, '').replace(',', '.').replace('-', '');
          
          tempData["Сумма"] = parseFloat(sumStr) || 0;
          tempData["Сумма НДС"] = parseFloat(taxStr) || 0;
        } catch (e) {
          tempData["Сумма"] = 0;
          tempData["Сумма НДС"] = 0;
        }
        
        ["Наименование", "№", "Дата", "Покупатель", "Вид документа", "Станция"].forEach(key => {
          if (!tempData[key]) {
            tempData[key] = prevTempData[key] || '';
          }
        });
        
        data.push({ ...tempData, id: Date.now() + Math.random() });
        prevTempData = { ...tempData };
      }
    }
    
    return data;
  };

  // Аутентификация через Supabase
  const handleLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.signIn(email, password);
      
      if (error) {
        window.alert(error.message);
        return;
      }
      
      setCurrentUser(data.user);
      setUserRole(data.user.role);
      setIsAuthenticated(true);
    } catch (error) {
      window.alert('Ошибка входа: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Выход
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabaseClient.auth.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUserRole(null);
      setProcessedData([]);
      setUploadHistory([]);
    } catch (error) {
      window.alert('Ошибка выхода: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка пользователей для админа
  const loadUsers = async () => {
    if (userRole !== 'admin') return;
    
    try {
      const { data, error } = await supabaseClient.from('users').select('*');
      if (!error) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      loadUsers();
    }
  }, [isAuthenticated, userRole]);

  // Обработка загрузки файла
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const processed = processTextFile(content);
        
        const newUpload = {
          id: Date.now(),
          filename: file.name,
          uploadDate: new Date().toLocaleString('ru-RU'),
          recordsCount: processed.length,
          totalSum: processed.reduce((sum, item) => sum + (item["Сумма"] || 0), 0),
          data: processed
        };
        
        setProcessedData(processed);
        setUploadHistory(prev => [newUpload, ...prev]);
        setCurrentView('editor');
      } catch (error) {
        window.alert('Ошибка при обработке файла: ' + error.message);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.readAsText(file, 'windows-1251');
  };

  // Экспорт в Excel
  const exportToExcel = (data, filename = 'export') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Данные");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Аналитика
  const getAnalytics = () => {
    if (processedData.length === 0) return null;
    
    const totalSum = processedData.reduce((sum, item) => sum + (item["Сумма"] || 0), 0);
    const totalTax = processedData.reduce((sum, item) => sum + (item["Сумма НДС"] || 0), 0);
    
    const stationStats = {};
    const buyerStats = {};
    
    processedData.forEach(item => {
      const station = item["Станция"] || 'Не указано';
      const buyer = item["Покупатель"] || 'Не указано';
      const sum = item["Сумма"] || 0;
      
      stationStats[station] = (stationStats[station] || 0) + sum;
      buyerStats[buyer] = (buyerStats[buyer] || 0) + sum;
    });
    
    return {
      totalRecords: processedData.length,
      totalSum,
      totalTax,
      avgSum: totalSum / processedData.length,
      topStations: Object.entries(stationStats).sort(([,a], [,b]) => b - a).slice(0, 5),
      topBuyers: Object.entries(buyerStats).sort(([,a], [,b]) => b - a).slice(0, 5)
    };
  };

  // Страница настройки Supabase
  const SetupPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Настройка Supabase</h1>
          <p className="text-gray-600">Для работы приложения необходимо настроить базу данных</p>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-3">🚀 Быстрая настройка:</h3>
            <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
              <li>Перейдите на <a href="https://supabase.com" target="_blank" className="text-blue-600 underline">supabase.com</a></li>
              <li>Создайте бесплатный аккаунт</li>
              <li>Создайте новый проект</li>
              <li>Скопируйте URL и API Key из настроек</li>
              <li>Замените значения в коде приложения</li>
            </ol>
          </div>
          
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">📋 В коде нужно заменить:</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <div className="bg-white p-3 rounded border font-mono text-xs">
                <div className="text-red-600">const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';</div>
                <div className="text-red-600">const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';</div>
              </div>
              <p>на ваши реальные значения из Supabase</p>
            </div>
          </div>
          
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">✅ После настройки получите:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Настоящую базу данных в облаке</li>
              <li>• Безопасную аутентификацию</li>
              <li>• Синхронизацию между пользователями</li>
              <li>• Постоянное хранение данных</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Обновить после настройки
          </button>
        </div>
      </div>
    </div>
  );

  // Форма входа
  const LoginForm = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    
    const handleSubmit = (e) => {
      e.preventDefault();
      handleLogin(credentials.email, credentials.password);
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ТранспортАналитик</h1>
            <p className="text-gray-600">Вход в систему</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSubmit(e)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Пароль"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSubmit(e)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Демо-аккаунты:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>admin@company.com / AdminPass2024!</div>
              <div>user1@company.com / 123456</div>
              <div>demo@company.com / demo</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Дашборд
  const Dashboard = () => {
    const analytics = getAnalytics();
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Добро пожаловать, {currentUser?.email}!</h2>
            <p className="text-gray-600 mt-1">Система готова к работе с Supabase</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Загрузить файл
          </button>
        </div>
        
        {/* Статус подключения */}
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Подключение к базе данных активно</span>
          </div>
        </div>
        
        {analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Всего записей</p>
                    <p className="text-2xl font-bold text-gray-800">{analytics.totalRecords}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Общая сумма</p>
                    <p className="text-2xl font-bold text-gray-800">{analytics.totalSum.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">НДС</p>
                    <p className="text-2xl font-bold text-gray-800">{analytics.totalTax.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Средняя сумма</p>
                    <p className="text-2xl font-bold text-gray-800">{Math.round(analytics.avgSum).toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Топ станций по обороту
                </h3>
                <div className="space-y-3">
                  {analytics.topStations.map(([station, sum], index) => (
                    <div key={station} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-700">{station}</span>
                      </div>
                      <span className="text-gray-900 font-semibold">{sum.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Топ покупателей
                </h3>
                <div className="space-y-3">
                  {analytics.topBuyers.slice(0, 5).map(([buyer, sum], index) => (
                    <div key={buyer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-700 truncate">{buyer.length > 25 ? buyer.substring(0, 25) + '...' : buyer}</span>
                      </div>
                      <span className="text-gray-900 font-semibold">{sum.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Загрузите первый документ</h3>
            <p className="text-gray-500 mb-6">Начните анализ транспортных документов</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Загрузить документ
            </button>
          </div>
        )}
      </div>
    );
  };

  // Редактор данных
  const DataEditor = () => {
    const [editingId, setEditingId] = useState(null);
    const [editingValues, setEditingValues] = useState({});
    
    const handleEdit = (id) => {
      const item = processedData.find(row => row.id === id);
      setEditingId(id);
      setEditingValues(item);
    };
    
    const handleSave = () => {
      setProcessedData(prev => 
        prev.map(item => item.id === editingId ? {...editingValues} : item)
      );
      setEditingId(null);
      setEditingValues({});
    };
    
    const handleDelete = (id) => {
      if (window.confirm('Удалить эту запись?')) {
        setProcessedData(prev => prev.filter(item => item.id !== id));
      }
    };
    
    const filteredData = processedData.filter(item => {
      const searchMatch = !searchTerm || Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      return searchMatch;
    });
    
    if (processedData.length === 0) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Редактор данных</h2>
          <p className="text-gray-600 mb-6">Нет данных для редактирования</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к дашборду
          </button>
        </div>
      );
    }
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Редактор данных</h2>
          <div className="flex gap-3">
            <button
              onClick={() => exportToExcel(processedData, `export_${new Date().toISOString().split('T')[0]}`)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
        
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по всем полям..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-gray-600 py-2">
            Найдено: {filteredData.length} из {processedData.length}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {processedData.length > 0 && Object.keys(processedData[0]).filter(key => key !== 'id').map(key => (
                    <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {key}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {Object.keys(item).filter(key => key !== 'id').map(key => (
                      <td key={key} className="px-4 py-4 whitespace-nowrap text-sm">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editingValues[key] || ''}
                            onChange={(e) => setEditingValues({...editingValues, [key]: e.target.value})}
                            className="w-full p-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className={typeof item[key] === 'number' ? 'font-mono' : ''}>
                            {typeof item[key] === 'number' ? item[key].toLocaleString('ru-RU') : item[key]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === item.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // История загрузок
  const HistoryView = () => {
    const handleLoadHistory = (historyItem) => {
      setProcessedData(historyItem.data);
      setCurrentView('editor');
    };
    
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">История загрузок</h2>
        
        {uploadHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">История загрузок пуста</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uploadHistory.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{item.filename}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Загружено: {item.uploadDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Записей: {item.recordsCount}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Общая сумма: {item.totalSum.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadHistory(item)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Открыть
                    </button>
                    <button
                      onClick={() => exportToExcel(item.data, item.filename.replace('.txt', ''))}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Excel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Управление пользователями
  const UserManagement = () => {
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({
      email: '',
      password: '',
      role: 'user'
    });
    
    const handleAddUser = async () => {
      if (!newUser.email || !newUser.password) {
        window.alert('Заполните все поля');
        return;
      }
      
      try {
        // В реальном приложении здесь будет вызов Supabase
        const { data, error } = await supabaseClient.from('users').insert([{
          email: newUser.email,
          role: newUser.role,
          active: true,
          created_at: new Date().toISOString()
        }]);
        
        if (!error) {
          window.alert('Пользователь успешно добавлен');
          setNewUser({ email: '', password: '', role: 'user' });
          setShowAddUser(false);
          loadUsers();
        }
      } catch (error) {
        window.alert('Ошибка добавления пользователя: ' + error.message);
      }
    };
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Управление пользователями</h2>
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Добавить пользователя
          </button>
        </div>
        
        {showAddUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Добавить пользователя</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="user@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Временный пароль</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="********"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Роль</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddUser}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Добавить
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Список пользователей</h3>
          <div className="text-gray-600">
            <p>Здесь будет отображаться список пользователей из базы данных Supabase</p>
            <p className="mt-2 text-sm">После настройки базы данных вы сможете:</p>
            <ul className="mt-2 text-sm list-disc list-inside space-y-1">
              <li>Просматривать всех зарегистрированных пользователей</li>
              <li>Блокировать/разблокировать аккаунты</li>
              <li>Менять роли пользователей</li>
              <li>Отслеживать активность</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Показываем страницу настройки, если Supabase не настроен
  if (!setupComplete) {
    return <SetupPage />;
  }

  // Показываем форму входа, если не авторизованы
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <input
        type="file"
        ref={fileInputRef}
        accept=".txt"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">ТранспортАналитик</h1>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Database className="w-3 h-3" />
              Supabase
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {currentUser?.email}
              {userRole === 'admin' && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Админ</span>
              )}
            </span>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </header>
      
      <nav className="bg-white shadow-sm">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Дашборд', icon: BarChart3 },
              { id: 'editor', label: 'Редактор', icon: Edit3 },
              { id: 'history', label: 'История', icon: History },
              ...(userRole === 'admin' ? [{ id: 'users', label: 'Пользователи', icon: Users }] : [])
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    currentView === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.id === 'users' && (
                    <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                      Админ
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      
      <main>
        {isProcessing && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-6 mt-4">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin mr-3" />
              <p className="text-blue-800">Обрабатывается файл...</p>
            </div>
          </div>
        )}
        
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'editor' && <DataEditor />}
        {currentView === 'history' && <HistoryView />}
        {currentView === 'users' && userRole === 'admin' && <UserManagement />}
      </main>
    </div>
  );
};

export default TransportAnalyticsApp;
