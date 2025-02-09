export function getUserIdBySessionStorage(){
	let user = JSON.parse(sessionStorage.getItem('user')!);
	console.log(user)
	return user["id"];
}

export function getUserFullNameBySessionStorage(){
	let user = JSON.parse(sessionStorage.getItem('user')!);
	console.log(user)
	return user["firstName"] + " " + user["lastName"];
}

export function generateGUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
	});
}
