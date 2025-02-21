export interface UserDto {
	id: string;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
	phoneNumber: string | null;
	roles: string[] | null;
}

export function formatUserName(user: UserDto): string {
	if (user.firstName && user.lastName) {
		return `${user.firstName} ${user.lastName}`;
	}
	if (user.firstName) {
		return user.firstName;
	}
	if (user.lastName) {
		return user.lastName;
	}
	if (user.email) {
		return user.email;
	}
	if (user.phoneNumber) {
		return user.phoneNumber;
	}
	return `User-${user.id}`; // Fallback si aucune info dispo
}