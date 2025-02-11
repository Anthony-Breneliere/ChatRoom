export interface UserDto {
	id: string;
	email?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	phoneNumber?: string | null;
	roles?: string[] | null;
}
