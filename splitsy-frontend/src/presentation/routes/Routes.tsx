import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { LoginPage } from '../pages/login/LoginPage/LoginPage';
import { RegisterPage } from '../pages/register/RegisterPage/RegisterPage';
import { HomePage } from '../pages/home/HomePage';
import { CreateGroupPage } from '../pages/groups/CreateGroupPage';
import { GroupDetailPage } from '../pages/groups/GroupDetailPage';
import { JoinGroupPage } from '../pages/groups/JoinGroupPage';
import { ProtectedRoute } from './ProtectedRoute';
import { getCompositionRoot } from '../../CompositionRoot';
import type { Group } from '../../domain/group/entities/Group';

export interface HomeLoaderData {
  groups: Group[];
}

async function homeLoader() {
  const token = localStorage.getItem('splitsy_access_token');
  if (!token) return redirect('/login');
  try {
    const root = getCompositionRoot();
    const groups = await root.useCases.groups.list.execute({});
    return { groups };
  } catch {
    return redirect('/login');
  }
}

async function groupDetailLoader({ params }: LoaderFunctionArgs) {
  const token = localStorage.getItem('splitsy_access_token');
  if (!token) return redirect('/login');
  try {
    const root = getCompositionRoot();
    const groupId = params.groupId as string;
    const [group, expenses, settlements, balances] = await Promise.all([
      root.useCases.groups.get.execute({ groupId }),
      root.useCases.expenses.list.execute({ groupId }),
      root.useCases.settlements.list.execute({ groupId }),
      root.useCases.groups.getBalances.execute({ groupId }),
    ]);

    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId: string = payload.sub;
    const isMember = group.participants.some((p) => p.userId === currentUserId && p.isActive !== false);
    if (!isMember) return redirect('/');

    return { group, expenses, settlements, balances };
  } catch {
    return redirect('/');
  }
}

export async function joinGroupLoader({ params }: LoaderFunctionArgs) {
  const token = localStorage.getItem('splitsy_access_token');
  const groupId = params.groupId as string;
  if (!token) {
    return redirect(`/login?redirect=/join/${groupId}`);
  }
  try {
    const root = getCompositionRoot();
    const group = await root.useCases.groups.get.execute({ groupId });
    return { group };
  } catch {
    return redirect(`/login?redirect=/join/${groupId}`);
  }
}

const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/register',
    Component: RegisterPage,
  },
  {
    path: '/join/:groupId',
    Component: JoinGroupPage,
    loader: joinGroupLoader,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: '/',
        Component: HomePage,
        loader: homeLoader,
      },
      {
        path: '/groups/new',
        Component: CreateGroupPage,
      },
      {
        path: '/groups/:groupId',
        Component: GroupDetailPage,
        loader: groupDetailLoader,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
