import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
import { format, parseISO } from 'date-fns';

// --- Interfaces (assuming these are correct based on previous discussions) ---
export interface ApiSkill {
  skill_id: string;
  skill_name: string;
  skill_code?: string;
  description?: string | null;
}

export interface ApiSubSkill {
  sub_skill_id: string;
  skill_id: string;
  sub_skill_name: string;
  description?: string | null;
}

export interface ApiLesson {
  lesson_id: string;
  title: string;
  lesson_date: string; // Expected "YYYY-MM-DD"
  start_time: string; // Raw time string from API
  end_time: string | null; // Raw time string from API
  evaluation_given: boolean | number;
  lesson_location: string | null;
  skill_id: string | null;
  skill_name: string | null;
}

export interface Skill extends ApiSkill {}
export interface SubSkill extends ApiSubSkill {}

export interface Lesson {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // Should be "HH:mm" or "N/A"
  endTime: string | null; // Should be "HH:mm" or null
  EvaluationGiven: boolean;
  location: string | null;
  skillId: string | null;
  skillName: string | null;
}

interface LessonContextType {
  lessons: Lesson[];
  skills: Skill[];
  subSkills: SubSkill[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchCoreData: (isRefresh?: boolean, userId?: string | null) => Promise<void>;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);
const API_BASE_URL = 'http://192.168.1.51/kreno-api';

// Ensure this is the robust version of the function
export const robustFormatApiTime = (dateStr: string, timeStr: string | null | undefined): string | null => {
  if (!timeStr || !dateStr) {
    console.warn(`LessonContext: robustFormatApiTime - Missing date or time. Date: "${dateStr}", Time: "${timeStr}"`);
    return null;
  }
  try {
    const dateTime = parseISO(`${dateStr}T${timeStr}`);
    const formattedTime = format(dateTime, 'HH:mm');
    return formattedTime;
  } catch (e) {
    console.warn(`LessonContext: robustFormatApiTime - parseISO failed for date "${dateStr}" time "${timeStr}". Error: ${e}. Attempting fallback.`);
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parts[0].trim();
      let minutes = parts[1].trim();
      if (hours.length === 1 && !isNaN(parseInt(hours))) hours = `0${hours}`;
      if (minutes.length === 1 && !isNaN(parseInt(minutes))) minutes = `0${minutes}`;
      if (hours.length === 2 && minutes.length === 2 && !isNaN(parseInt(hours)) && !isNaN(parseInt(minutes))) {
        const fallbackFormattedTime = `${hours}:${minutes}`;
        console.log(`LessonContext: robustFormatApiTime - Fallback successful. Original time: "${timeStr}", Formatted: "${fallbackFormattedTime}"`);
        return fallbackFormattedTime;
      }
    }
    console.error(`LessonContext: robustFormatApiTime - All formatting attempts failed for time "${timeStr}" with date "${dateStr}". Returning null.`);
    return null;
  }
};

export const LessonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [subSkills, setSubSkills] = useState<SubSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processApiLessons = (apiLessons: ApiLesson[]): Lesson[] => {
    return apiLessons.map(apiLesson => {
      const formattedStartTime = robustFormatApiTime(apiLesson.lesson_date, apiLesson.start_time) || 'N/A';
      const formattedEndTime = apiLesson.end_time ? robustFormatApiTime(apiLesson.lesson_date, apiLesson.end_time) : null;
      return {
        id: apiLesson.lesson_id,
        title: apiLesson.title,
        date: apiLesson.lesson_date,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        EvaluationGiven: !!apiLesson.evaluation_given,
        location: apiLesson.lesson_location,
        skillId: apiLesson.skill_id,
        skillName: apiLesson.skill_name,
      };
    });
  };

  const fetchCoreData = useCallback(async (isRefresh = false, userId?: string | null) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const lessonsUrl = userId ? `${API_BASE_URL}/lessons_api.php?userId=${userId}` : `${API_BASE_URL}/lessons_api.php`;
      const [lessonsResponse, skillsResponse, subSkillsResponse] = await Promise.all([
        fetch(lessonsUrl),
        fetch(`${API_BASE_URL}/skills_api.php`),
        fetch(`${API_BASE_URL}/sub_skills_api.php`)
      ]);

      if (!lessonsResponse.ok) throw new Error(`Lessons API Error: ${lessonsResponse.status} ${lessonsResponse.statusText}`);
      const lessonsResult = await lessonsResponse.json();
      if (lessonsResult.success && Array.isArray(lessonsResult.lessons)) {
        setLessons(processApiLessons(lessonsResult.lessons));
      } else if (lessonsResult.success && lessonsResult.lessons === undefined) {
        setLessons([]);
      } else {
        throw new Error(`Lessons API Error: ${lessonsResult.message || 'Failed to parse lessons data'}`);
      }

      if (!skillsResponse.ok) throw new Error(`Skills API Error: ${skillsResponse.status} ${skillsResponse.statusText}`);
      const skillsResult = await skillsResponse.json();
      if (skillsResult.success && Array.isArray(skillsResult.skills)) {
        setSkills(skillsResult.skills);
      } else if (skillsResult.success && skillsResult.skills === undefined) {
        setSkills([]);
      } else {
        throw new Error(`Skills API Error: ${skillsResult.message || 'Failed to parse skills data'}`);
      }

      if (!subSkillsResponse.ok) throw new Error(`Sub-Skills API Error: ${subSkillsResponse.status} ${subSkillsResponse.statusText}`);
      const subSkillsResult = await subSkillsResponse.json();
      if (subSkillsResult.success && Array.isArray(subSkillsResult.sub_skills)) {
        setSubSkills(subSkillsResult.sub_skills);
      } else if (subSkillsResult.success && subSkillsResult.sub_skills === undefined) {
        setSubSkills([]);
      } else {
        throw new Error(`Sub-Skills API Error: ${subSkillsResult.message || 'Failed to parse sub-skills data'}`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while fetching data.";
      console.error("Failed to fetch core data (LessonContext):", errorMessage, e);
      setError(errorMessage);
    } finally {
      if (isRefresh) setIsRefreshing(false);
      else setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoreData(false, null);
  }, [fetchCoreData]);

  return (
    <LessonContext.Provider value={{ lessons, skills, subSkills, isLoading, isRefreshing, error, fetchCoreData }}>
      {children}
    </LessonContext.Provider>
  );
};

export const useLessonData = () => {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error('useLessonData must be used within a LessonProvider');
  }
  return context;
};