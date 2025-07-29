import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCyberPlan } from "../../hooks/useCyberPlan";
import { getPlanData } from "../../services/dataService";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, Clock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

function getTodayKey() {
  // احصل على اليوم الحالي (السبت = 0)
  const days = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];
  const jsDay = new Date().getDay();
  // في بعض البيئات السبت=6، الأحد=0
  return days[jsDay === 0 ? 1 : jsDay === 6 ? 0 : jsDay];
}

export default function UpcomingTasks() {
  const { t } = useTranslation();
  const { lang } = useApp();
  const navigate = useNavigate();
  const { plan, loading } = useCyberPlan();
  const [tasks, setTasks] = useState([]);
  const [weekId, setWeekId] = useState(null);
  const todayKey = getTodayKey();

  useEffect(() => {
    async function fetchTasks() {
      const planData = await getPlanData();
      let found = null;
      for (const week of planData) {
        for (const day of week.days) {
          if (day.key === todayKey) {
            found = { week, day };
            break;
          }
        }
        if (found) break;
      }
      if (!found) return setTasks([]);
      setWeekId(found.week.week);
      const doneMap = {};
      plan.forEach(w => {
        (w.tasks || []).forEach(t => {
          if (t.id && t.done) doneMap[t.id] = true;
        });
      });
      let unDone = (found.day.tasks || []).filter(task => !doneMap[task.id]);
      // ترتيب حسب localStorage إذا وجد
      const order = JSON.parse(localStorage.getItem("upcomingTasksOrder") || "[]");
      if (order.length) {
        unDone = unDone.slice().sort((a, b) => (order.indexOf(a.id) === -1 ? 9999 : order.indexOf(a.id)) - (order.indexOf(b.id) === -1 ? 9999 : order.indexOf(b.id)));
      }
      setTasks(unDone);
    }
    fetchTasks();
  }, [plan]);

  // عند تغيير ترتيب السحب
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setTasks(items);
    // احفظ الترتيب في localStorage
    localStorage.setItem("upcomingTasksOrder", JSON.stringify(items.map(t => t.id)));
    toast.success("تم حفظ ترتيب المهام لليوم!");
  };

  const handleTaskClick = (task) => {
    navigate(`/day/${weekId}/${todayKey}`, { state: { focusTask: task.id } });
  };

  const handleTaskComplete = (taskId) => {
    // هنا يمكن إضافة منطق إكمال المهمة
    toast.success("تم إكمال المهمة!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 min-h-[120px]">
        <div className="w-8 h-8 border-2 border-light-accent border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">{t("loading", "جاري التحميل...")}</span>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <motion.div 
        className="flex-1 flex flex-col gap-3 justify-center items-center text-center min-h-[120px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">أحسنت!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("noTasksToday", "لا توجد مهام غير منجزة لليوم الحالي.")}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="upcoming-tasks-droppable" direction="vertical">
        {(provided) => (
          <ul 
            className="flex flex-col gap-3" 
            ref={provided.innerRef} 
            {...provided.droppableProps}
          >
            <AnimatePresence>
              {tasks.map((task, i) => (
                <Draggable key={task.id} draggableId={task.id.toString()} index={i}>
                  {(provided, snapshot) => (
                    <motion.li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: i * 0.1 }}
                      className={`
                        group relative rounded-xl p-4 bg-gradient-to-r from-blue-50 to-cyan-50 
                        dark:from-blue-900/20 dark:to-cyan-900/20 
                        border border-blue-200 dark:border-blue-800 
                        hover:shadow-lg hover:scale-[1.02] transition-all duration-200
                        ${snapshot.isDragging ? "ring-2 ring-light-accent dark:ring-dark-accent scale-105 shadow-xl" : ""}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleTaskComplete(task.id)}
                          className="mt-1 p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors"
                        >
                          <Circle className="w-5 h-5 text-blue-500 hover:text-blue-600" />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                            {task.description?.[lang] || task.description?.ar || task.description?.en || ""}
                          </h4>
                          
                          {task.duration && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{task.duration} دقيقة</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleTaskClick(task)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-all duration-200"
                        >
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="mt-3 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                      </div>
                    </motion.li>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}