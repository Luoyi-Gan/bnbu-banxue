import { afterEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SportsDashboard } from '../src/live/SportsDashboard';

afterEach(() => vi.unstubAllEnvs());
const render = (role: 'student' | 'teacher') => renderToStaticMarkup(<SportsDashboard data={null} role={role} sourceLabel="体育数据暂不可用"/>);

it('学生入口未配置时不跳教师管理页或失效的本地体育业务页', () => {
  vi.stubEnv('VITE_SPORTS_STUDENT_URL', '');
  const html = render('student');
  expect(html).toContain('体育平台入口待部署配置');
  expect(html).not.toContain('href=');
  expect(html).toContain('aria-disabled="true"');
});

it('学生使用独立配置的入口，教师沿用用户指定入口', () => {
  vi.stubEnv('VITE_SPORTS_STUDENT_URL', 'https://students.example.test/sports');
  vi.stubEnv('VITE_SPORTS_TEACHER_URL', '');
  expect(render('student')).toContain('href="https://students.example.test/sports"');
  expect(render('student')).not.toContain('#admin/accounts');
  expect(render('teacher')).toContain('href="https://www.teacher.bnbusports.cn/#admin/accounts"');
});

it('无效入口或带凭据的地址不生成可点击跳转', () => {
  for (const url of ['javascript:alert(1)', 'https://name:password@example.test', '/student/index.html']) {
    vi.stubEnv('VITE_SPORTS_STUDENT_URL', url);
    expect(render('student')).not.toContain('href=');
  }
});
