import { db } from './index'
import type { Goal, Project, Task } from '@/types'

const G1 = 'demo-goal-product'
const G2 = 'demo-goal-growth'
const G3 = 'demo-goal-health'

const P1 = 'demo-proj-design'
const P2 = 'demo-proj-dev'
const P3 = 'demo-proj-marketing'
const P4 = 'demo-proj-courses'
const P5 = 'demo-proj-sport'

export async function seedDemoData() {
  await db.transaction('rw', [db.goals, db.projects, db.tasks, db.timeEntries, db.tags, db.taskTags], async () => {
    await db.goals.clear()
    await db.projects.clear()
    await db.tasks.clear()
    await db.timeEntries.clear()
    await db.tags.clear()
    await db.taskTags.clear()
  })

  const now = new Date()
  const d = (days: number) => new Date(now.getTime() + days * 86_400_000)

  const goals: Goal[] = [
    { id: G1, title: 'Запустить продукт', status: 'active', createdAt: d(-30), updatedAt: now },
    { id: G2, title: 'Личный рост', status: 'active', createdAt: d(-20), updatedAt: now },
    { id: G3, title: 'Здоровье и спорт', status: 'active', createdAt: d(-10), updatedAt: now },
  ]

  const projects: Project[] = [
    { id: P1, goalId: G1, title: 'Дизайн интерфейса', status: 'active', createdAt: d(-29), updatedAt: now },
    { id: P2, goalId: G1, title: 'Разработка MVP', status: 'active', createdAt: d(-28), updatedAt: now },
    { id: P3, goalId: G1, title: 'Маркетинг и продвижение', status: 'active', createdAt: d(-27), updatedAt: now },
    { id: P4, goalId: G2, title: 'Онлайн-курсы', status: 'active', createdAt: d(-19), updatedAt: now },
    { id: P5, goalId: G3, title: 'Тренировки', status: 'active', createdAt: d(-9), updatedAt: now },
  ]

  const tasks: Task[] = [
    // Разработка MVP — хорошо заполненный проект для канбана
    { id: 't-dev-1', projectId: P2, title: 'Настроить CI/CD пайплайн', status: 'done', priority: 'high', totalTime: 5400, createdAt: d(-25), updatedAt: d(-12) },
    { id: 't-dev-2', projectId: P2, title: 'Написать тесты для API', status: 'in_progress', priority: 'high', dueDate: d(2), totalTime: 2700, createdAt: d(-18), updatedAt: d(-1) },
    { id: 't-dev-3', projectId: P2, title: 'Интегрировать платёжную систему', status: 'todo', priority: 'high', dueDate: d(5), totalTime: 0, createdAt: d(-15), updatedAt: d(-15) },
    { id: 't-dev-4', projectId: P2, title: 'Оптимизировать запросы к базе данных', status: 'todo', priority: 'medium', totalTime: 0, createdAt: d(-14), updatedAt: d(-14) },
    { id: 't-dev-5', projectId: P2, title: 'Добавить логирование ошибок', status: 'in_progress', priority: 'medium', dueDate: d(3), totalTime: 1200, createdAt: d(-12), updatedAt: d(-2) },
    { id: 't-dev-6', projectId: P2, title: 'Написать документацию API', status: 'todo', priority: 'low', totalTime: 0, createdAt: d(-10), updatedAt: d(-10) },
    { id: 't-dev-7', projectId: P2, title: 'Настроить мониторинг и алерты', status: 'done', priority: 'medium', totalTime: 3600, createdAt: d(-8), updatedAt: d(-4) },
    { id: 't-dev-8', projectId: P2, title: 'Провести нагрузочное тестирование', status: 'todo', priority: 'low', dueDate: d(10), totalTime: 0, createdAt: d(-5), updatedAt: d(-5) },

    // Дизайн интерфейса
    { id: 't-des-1', projectId: P1, title: 'Создать дизайн-систему', status: 'done', priority: 'high', totalTime: 7200, createdAt: d(-28), updatedAt: d(-15) },
    { id: 't-des-2', projectId: P1, title: 'Нарисовать макеты основных экранов', status: 'in_progress', priority: 'high', dueDate: d(1), totalTime: 4500, createdAt: d(-20), updatedAt: d(-1) },
    { id: 't-des-3', projectId: P1, title: 'Подготовить спецификации компонентов', status: 'todo', priority: 'medium', dueDate: d(7), totalTime: 0, createdAt: d(-15), updatedAt: d(-15) },
    { id: 't-des-4', projectId: P1, title: 'Провести UX-ревью с командой', status: 'todo', priority: 'low', totalTime: 0, createdAt: d(-10), updatedAt: d(-10) },

    // Маркетинг
    { id: 't-mkt-1', projectId: P3, title: 'Написать контент-план на квартал', status: 'todo', priority: 'high', dueDate: d(-1), totalTime: 0, createdAt: d(-10), updatedAt: d(-10) },
    { id: 't-mkt-2', projectId: P3, title: 'Настроить аналитику и GTM', status: 'in_progress', priority: 'medium', totalTime: 1800, createdAt: d(-8), updatedAt: d(-2) },
    { id: 't-mkt-3', projectId: P3, title: 'Запустить рекламную кампанию', status: 'todo', priority: 'low', totalTime: 0, createdAt: d(-5), updatedAt: d(-5) },

    // Онлайн-курсы
    { id: 't-crs-1', projectId: P4, title: 'Пройти курс по TypeScript', status: 'in_progress', priority: 'high', dueDate: d(14), totalTime: 9000, createdAt: d(-18), updatedAt: d(-1) },
    { id: 't-crs-2', projectId: P4, title: 'Изучить основы системного дизайна', status: 'todo', priority: 'medium', totalTime: 0, createdAt: d(-10), updatedAt: d(-10) },

    // Тренировки
    { id: 't-spt-1', projectId: P5, title: 'Силовая тренировка 3×/неделю', status: 'in_progress', priority: 'medium', totalTime: 10800, createdAt: d(-9), updatedAt: d(-1) },
    { id: 't-spt-2', projectId: P5, title: 'Бег по утрам 5 км', status: 'todo', priority: 'low', totalTime: 0, createdAt: d(-8), updatedAt: d(-8) },

    // Inbox
    { id: 't-inbox-1', title: 'Обновить лицензионное соглашение', status: 'todo', priority: 'high', dueDate: d(3), totalTime: 0, createdAt: d(-5), updatedAt: d(-5) },
    { id: 't-inbox-2', title: 'Записаться на конференцию', status: 'todo', priority: 'medium', totalTime: 0, createdAt: d(-4), updatedAt: d(-4) },
    { id: 't-inbox-3', title: 'Обновить README проекта', status: 'todo', priority: 'low', totalTime: 0, createdAt: d(-3), updatedAt: d(-3) },
  ]

  await db.goals.bulkAdd(goals)
  await db.projects.bulkAdd(projects)
  await db.tasks.bulkAdd(tasks)
}
