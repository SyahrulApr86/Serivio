// Stub so sveltekit-superforms' typebox adapter can be loaded without error.
// This project uses Valibot, not TypeBox; this file is never called at runtime.
export class Base {
	Check() { return false; }
	Errors() { return []; }
	Create() { return null; }
}

const Type = { Base };
export default Type;
