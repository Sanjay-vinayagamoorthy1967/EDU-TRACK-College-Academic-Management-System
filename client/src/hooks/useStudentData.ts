import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export const useStudentData = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/students/me');
        const me = res.data;
        setStudentData({
          ...me,
          name: me.user?.name || me.name || user?.name || '',
          email: me.user?.email || me.email || user?.email || '',
          phone: me.user?.phone || me.phone || '',
          avatar: me.user?.avatar || me.profilePhoto || '',
          collegeName: me.college?.name || me.collegeName || '',
          results: (me.results || []).map((r: any) => ({
            ...r,
            subjects: r.subjects || [],
          })),
        });
      } catch {
        // server down
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  return { studentData, loading };
};
