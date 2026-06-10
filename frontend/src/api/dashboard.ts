import { apiGet } from './client';
import type { Dashboard } from '../types/dashboard';

export function buscarDashboard() {
  return apiGet<Dashboard>('/dashboard');
}