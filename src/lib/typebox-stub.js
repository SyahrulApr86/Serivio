// Stub so sveltekit-superforms' typebox adapter loads without error.
// This project uses Valibot; TypeBox is never called at runtime.
export class Base {
	Check() { return false; }
	Errors() { return []; }
	Create() { return null; }
}
const Type = { Base };
export default Type;
