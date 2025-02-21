import path from "path";

export const SITEMAP = {
	main: { path: '', route: '/' },
	account: { path: 'account', route: '/account' },
	admin: { path: 'admin', route: '/admin' },
	auth: { path: 'auth', route: '/auth' },
	login: { path: 'login', route: '/auth/login' },
	maintenance: { path: 'maintenance', route: '/maintenance' },
	forbidden: { path: 'forbidden', route: '/forbidden' },
	unauthorized: { path: 'unauthorized', route: '/unauthorized' },
	chat: { path: 'chat', route: '/chat' },
} as const;
