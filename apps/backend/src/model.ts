import { t, type TSchema } from "elysia";

export const ErrorResponseSchema = t.Object({
	error: t.String(),
	reason: t.String(),
});

export function ResponsePaginate<T extends TSchema>(type: T) {
	return t.Object({
		data: t.Array(type),
		meta: t.Object({
			total: t.Integer(),
			max: t.Integer(),
			page: t.Integer(),
		}),
	});
}

export function QueryPaginate<T extends TSchema>(type: T) {
	return t.Composite([
		t.Omit(
			type,
			t.Union([
				t.Literal("organizationId"),
				t.Literal("AND"),
				t.Literal("OR"),
				t.Literal("NOT"),
			])
		),
		PaginationQuery,
	]);
}

export const PaginationQuery = t.Object({
	page: t.Integer(),
	max: t.Integer({
		maximum: 50,
		minimum: 5,
	}),
});
