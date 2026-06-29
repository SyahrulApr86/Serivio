<script lang="ts">
	import type { PosterData } from '../../routes/+page.server';

	let { posters = [] }: { posters: PosterData[] } = $props();

	// CSS gradient fallbacks per column position
	const fallbacks = [
		'linear-gradient(160deg,#0d1b6e,#1a4fcc,#3b82f6)',
		'linear-gradient(160deg,#2d0000,#7c1d00,#c0390f)',
		'linear-gradient(160deg,#7c1060,#c0308a,#f75cc3)',
		'linear-gradient(160deg,#0a3d62,#0e7490,#06b6d4)',
		'linear-gradient(160deg,#1a0a2e,#5b21b6,#7c3aed)',
		'linear-gradient(160deg,#0f2027,#203a43,#2c5364)',
		'linear-gradient(160deg,#1a1a4e,#4338ca,#818cf8)',
		'linear-gradient(160deg,#1c0000,#5c1010,#dc2626)',
		'linear-gradient(160deg,#1c1207,#78350f,#b45309)',
		'linear-gradient(160deg,#0c1a0c,#14532d,#16a34a)',
		'linear-gradient(160deg,#0a0a1a,#1e1e3f,#4f46e5)',
		'linear-gradient(160deg,#1a0a00,#7c2d12,#f97316)',
	];

	// Pad/trim to 12 items for 4 cols × 3 rows
	const items = Array.from({ length: 12 }, (_, i) => ({
		...(posters[i] ?? { title: '', image: '', ep: '' }),
		fallback: fallbacks[i]
	}));

	const cols = [items.slice(0,3), items.slice(3,6), items.slice(6,9), items.slice(9,12)];
	const offsets = ['mt-0', '-mt-10', 'mt-6', '-mt-16'];
</script>

<div class="collage" aria-hidden="true">
	<!-- Poster grid -->
	<div class="grid">
		{#each cols as col, ci}
			<div class="col {offsets[ci]}">
				{#each col as item}
					<div class="card" style="background:{item.fallback}">
						{#if item.image}
							<img src={item.image} alt={item.title} class="cover" loading="lazy" />
						{/if}
						{#if item.title}
							<div class="foot">
								<span class="name">{item.title}</span>
								<span class="ep">{item.ep}</span>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Edge fade: only hides the outer crop edges, center stays transparent -->
	<div class="edge-fade"></div>

	<!-- Prism color glow blobs -->
	<div class="blob blob-pink"></div>
	<div class="blob blob-blue"></div>
	<div class="blob blob-gold"></div>

	<!-- Final white wash over center so text is readable -->
	<div class="center-wash"></div>
</div>

<style>
	.collage {
		position: absolute;
		inset: -60px -80px;
		pointer-events: none;
	}

	.grid {
		position: absolute;
		inset: 0;
		display: flex;
		gap: 16px;
		padding: 0 24px;
		transform: rotate(-8deg) scale(1.2);
		transform-origin: center 45%;
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 16px;
		flex: 1;
	}

	.card {
		position: relative;
		border-radius: 14px;
		overflow: hidden;
		aspect-ratio: 2/3;
		flex-shrink: 0;
	}

	.cover {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.foot {
		position: absolute;
		bottom: 0; left: 0; right: 0;
		padding: 28px 10px 10px;
		background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
		display: flex;
		flex-direction: column;
		gap: 2px;
		z-index: 1;
	}

	.name {
		color: #fff;
		font-size: 11px;
		font-weight: 700;
		font-family: sans-serif;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ep {
		color: rgba(255,255,255,0.6);
		font-size: 9px;
		font-family: sans-serif;
	}

	/* Fade only the outer edges/corners — center transparent */
	.edge-fade {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(to right,  #fff 0%, transparent 18%, transparent 82%, #fff 100%),
			linear-gradient(to bottom, #fff 0%, transparent 15%, transparent 80%, #fff 100%);
	}

	/* Color glow blobs — sit on top of posters, under text */
	.blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(90px);
	}
	.blob-pink  { width: 500px; height: 500px; left: 25%;  top: -100px; background: #f75cc3; opacity: 0.18; }
	.blob-blue  { width: 400px; height: 400px; right: 10%; top:   5%;   background: #2969ff; opacity: 0.16; }
	.blob-gold  { width: 350px; height: 350px; left: 10%;  bottom: -40px; background: #ffd363; opacity: 0.18; }

	/* Light white center wash — keeps text readable without killing posters at edges */
	.center-wash {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse 60% 50% at 50% 40%,
			rgba(255,255,255,0.78) 0%,
			rgba(255,255,255,0.55) 40%,
			rgba(255,255,255,0.0) 70%
		);
	}
</style>
