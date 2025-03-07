export const SITEMAP = {
	main: { path: '', route: '/' },
	account: { path: 'account', route: '/account' },
	dashboard: { path: 'dashboard', route: '/dashboard' },
	admin: { path: 'admin', route: '/admin' },
	auth: { path: 'auth', route: '/auth' },
	login: { path: 'login', route: '/auth/login' },
	maintenance: { path: 'maintenance', route: '/maintenance' },
	forbidden: { path: 'forbidden', route: '/forbidden' },
	unauthorized: { path: 'unauthorized', route: '/unauthorized' },
	chatroom: { path: 'chatroom', route: '/chatroom' },
} as const;
