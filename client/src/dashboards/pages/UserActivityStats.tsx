import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchAdvancedUserStats, fetchUserContributions } from '@/redux/slice/stateSlice';
import { FaUserShield, FaFilter, FaCalendarAlt, FaSearch } from 'react-icons/fa';

export const UserActivityStats = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { advancedUserStats, userContributions, loading } = useSelector((state: RootState) => state.stats);

  const [timeframe, setTimeframe] = useState('all'); // all, today, week, month, year, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const calculateDates = (tf: string) => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

    switch (tf) {
      case 'today':
        start = today.toISOString().split('T')[0];
        break;
      case 'week':
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        start = lastWeek.toISOString().split('T')[0];
        break;
      case 'month':
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        start = lastMonth.toISOString().split('T')[0];
        break;
      case 'year':
        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);
        start = lastYear.toISOString().split('T')[0];
        break;
    }
    return { start, end };
  };

  const handleSearch = () => {
    let finalStart = startDate;
    let finalEnd = endDate;

    if (timeframe !== 'all' && timeframe !== 'custom') {
      const dates = calculateDates(timeframe);
      finalStart = dates.start;
      finalEnd = dates.end;
    }

    dispatch(fetchAdvancedUserStats({
      userId: selectedUser || undefined,
      startDate: finalStart || undefined,
      endDate: finalEnd || undefined
    }));
  };

  useEffect(() => {
    // Initial fetch
    if (!userContributions) {
      dispatch(fetchUserContributions());
    }
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <FaFilter className="text-blue-500" />
          تصفية نشاط المستخدمين
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaUserShield className="text-gray-400" /> المستخدم
            </label>
            <div className="relative">
              <div 
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white flex justify-between items-center min-h-[42px]"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <span className="text-gray-700 truncate">
                  {selectedUser 
                    ? userContributions?.find(u => u.userId === selectedUser)?.fullName 
                    : "جميع المستخدمين"}
                </span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>

              {isUserDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 flex flex-col top-full left-0">
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="ابحث بالاسم أو البريد..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="overflow-y-auto">
                    <div 
                      className={`p-2 cursor-pointer hover:bg-blue-50 text-sm ${selectedUser === '' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedUser('');
                        setIsUserDropdownOpen(false);
                      }}
                    >
                      جميع المستخدمين
                    </div>
                    {userContributions
                      ?.filter(u => u.role !== 'admin')
                      .filter(u => 
                        u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                        u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                      )
                      .map(u => (
                        <div 
                          key={u.userId}
                          className={`p-2 cursor-pointer hover:bg-blue-50 text-sm border-t border-gray-50 ${selectedUser === u.userId ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                          onClick={() => {
                            setSelectedUser(u.userId);
                            setIsUserDropdownOpen(false);
                          }}
                        >
                          <p>{u.fullName}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      ))}
                    {userContributions?.filter(u => u.role !== 'admin').filter(u => 
                        u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                        u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                      ).length === 0 && (
                      <div className="p-3 text-center text-sm text-gray-500">لا يوجد نتائج</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeframe Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" /> الفترة الزمنية
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">كل الأوقات</option>
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="year">هذه السنة</option>
              <option value="custom">تاريخ مخصص</option>
            </select>
          </div>

          {/* Custom Date Filters */}
          {timeframe === 'custom' && (
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaSearch /> بحث وتحديث
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          نتائج النشاط
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                  <th className="p-4 font-semibold">المستخدم</th>
                  <th className="p-4 font-semibold">الدور</th>
                  <th className="p-4 font-semibold">المتعاملين</th>
                  <th className="p-4 font-semibold">السائقين</th>
                  <th className="p-4 font-semibold">المركبات</th>
                  <th className="p-4 font-semibold">المجموع الكلي</th>
                </tr>
              </thead>
              <tbody>
                {advancedUserStats && advancedUserStats.map((user) => (
                  <tr key={user.userId} className="border-b border-gray-100 hover:bg-blue-50">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-blue-600 font-medium">{user.operateurCount}</td>
                    <td className="p-4 text-green-600 font-medium">{user.chauffeurCount}</td>
                    <td className="p-4 text-purple-600 font-medium">{user.vehicleCount}</td>
                    <td className="p-4 font-bold text-gray-900 text-lg">{user.totalCount}</td>
                  </tr>
                ))}
                {(!advancedUserStats || advancedUserStats.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      لا توجد بيانات لهذه التصفية.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityStats;
