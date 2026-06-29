<script lang="ts">
	// CSS-only poster collage — no external images needed.
	// Gradient colors simulate vibrant anime/film cover art.
	const posters = [
		{ title: 'Solo Leveling',      ep: 'Ch. 179',  status: 'Reading',   bg: 'linear-gradient(160deg,#0d1b6e,#1a4fcc,#3b82f6)' },
		{ title: 'Attack on Titan',    ep: 'Ep. 87',   status: 'Completed', bg: 'linear-gradient(160deg,#2d0000,#7c1d00,#c0390f)' },
		{ title: 'Spy × Family',       ep: 'Ep. 25',   status: 'Watching',  bg: 'linear-gradient(160deg,#7c1060,#c0308a,#f75cc3)' },
		{ title: 'One Piece',          ep: 'Ep. 1112', status: 'Watching',  bg: 'linear-gradient(160deg,#0a3d62,#0e7490,#06b6d4)' },
		{ title: 'Demon Slayer',       ep: 'Ep. 44',   status: 'Completed', bg: 'linear-gradient(160deg,#1a0a2e,#5b21b6,#7c3aed)' },
		{ title: 'Jujutsu Kaisen',     ep: 'Ep. 47',   status: 'Watching',  bg: 'linear-gradient(160deg,#0f2027,#203a43,#2c5364)' },
		{ title: 'Your Name.',         ep: 'Movie',    status: 'Completed', bg: 'linear-gradient(160deg,#1a1a4e,#4338ca,#818cf8)' },
		{ title: 'Chainsaw Man',       ep: 'Ep. 12',   status: 'Completed', bg: 'linear-gradient(160deg,#1c0000,#5c1010,#dc2626)' },
		{ title: 'Vinland Saga',       ep: 'Ep. 48',   status: 'Watching',  bg: 'linear-gradient(160deg,#1c1207,#78350f,#b45309)' },
		{ title: 'Mob Psycho 100',     ep: 'Ep. 37',   status: 'Completed', bg: 'linear-gradient(160deg,#0c1a0c,#14532d,#16a34a)' },
		{ title: 'Death Note',         ep: 'Ep. 37',   status: 'Completed', bg: 'linear-gradient(160deg,#0a0a0a,#1c1c1c,#292929)' },
		{ title: 'Hunter × Hunter',    ep: 'Ep. 148',  status: 'On Hold',   bg: 'linear-gradient(160deg,#0c2340,#1e4976,#2563eb)' },
		{ title: 'FMA: Brotherhood',   ep: 'Ep. 64',   status: 'Completed', bg: 'linear-gradient(160deg,#2d1507,#92400e,#d97706)' },
		{ title: 'Steins;Gate',        ep: 'Ep. 24',   status: 'Completed', bg: 'linear-gradient(160deg,#0a1628,#1e3a5f,#1d4ed8)' },
		{ title: 'Re:Zero',            ep: 'Ep. 50',   status: 'Watching',  bg: 'linear-gradient(160deg,#1e0030,#6b21a8,#a855f7)' },
		{ title: 'Berserk',            ep: 'Vol. 41',  status: 'Reading',   bg: 'linear-gradient(160deg,#0d0d0d,#1a0a00,#3d1500)' },
		{ title: 'Overlord',           ep: 'Ep. 52',   status: 'Watching',  bg: 'linear-gradient(160deg,#050510,#0f0a2e,#1e1060)' },
		{ title: 'Naruto Shippuden',   ep: 'Ep. 500',  status: 'Completed', bg: 'linear-gradient(160deg,#1a0a00,#7c2d12,#f97316)' },
		{ title: 'Bleach: TYBW',       ep: 'Ep. 61',   status: 'Watching',  bg: 'linear-gradient(160deg,#0a0a1a,#1e1e3f,#4f46e5)' },
		{ title: 'The Last of Us',     ep: 'Ep. 9',    status: 'Completed', bg: 'linear-gradient(160deg,#0a1a08,#1c3a14,#365314)' },
	];

	// 4 columns, staggered
	const cols: typeof posters[] = [[], [], [], []];
	posters.forEach((p, i) => cols[i % 4].push(p));
	const offsets = ['mt-0', 'mt-10', 'mt-5', 'mt-16'];
</script>

<!-- Background collage: posters → white radial → color glow -->
<div class="collage" aria-hidden="true">
	<!-- Poster grid -->
	<div class="grid">
		{#each cols as col, ci}
			<div class="col {offsets[ci]}">
				{#each col as p}
					<div class="card" style="background:{p.bg}">
						<span class="status">{p.status}</span>
						<div class="card-foot">
							<span class="card-title">{p.title}</span>
							<span class="card-ep">{p.ep}</span>
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- White radial: transparent center → opaque edges, kills poster visibility near text -->
	<div class="overlay-radial"></div>

	<!-- Prism color glow blobs (same as before, but now they sit above the posters) -->
	<div class="blob blob-pink"></div>
	<div class="blob blob-blue"></div>
	<div class="blob blob-gold"></div>
</div>

<style>
	.collage {
		position: absolute;
		inset: -40px -60px;
		pointer-events: none;
		overflow: hidden;
	}

	/* Poster grid: slightly rotated, low opacity, slight blur */
	.grid {
		position: absolute;
		inset: 0;
		display: flex;
		gap: 14px;
		padding: 0 20px;
		transform: rotate(-7deg) scale(1.18);
		transform-origin: center 40%;
		opacity: 0.14;
		filter: blur(1.5px);
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 14px;
		flex: 1;
	}

	.card {
		position: relative;
		border-radius: 12px;
		overflow: hidden;
		aspect-ratio: 2/3;
		flex-shrink: 0;
		box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
	}

	.status {
		position: absolute;
		top: 8px;
		right: 8px;
		background: rgba(0,0,0,0.45);
		color: #fff;
		font-size: 9px;
		font-weight: 600;
		letter-spacing: 0.04em;
		padding: 2px 6px;
		border-radius: 4px;
		font-family: sans-serif;
	}

	.card-foot {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24px 10px 10px;
		background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.card-title {
		color: #fff;
		font-size: 11px;
		font-weight: 700;
		line-height: 1.2;
		font-family: sans-serif;
	}

	.card-ep {
		color: rgba(255,255,255,0.65);
		font-size: 9px;
		font-family: sans-serif;
	}

	/* White radial: center transparent so text area is clean, edges opaque */
	.overlay-radial {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse 65% 55% at 50% 42%,
			rgba(255,255,255,0.82) 0%,
			rgba(255,255,255,0.92) 45%,
			rgba(255,255,255,0.98) 75%,
			#ffffff 100%
		);
	}

	/* Color glow blobs */
	.blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.22;
	}
	.blob-pink {
		width: 420px; height: 420px;
		left: 30%; top: -80px;
		background: #f75cc3;
	}
	.blob-blue {
		width: 360px; height: 360px;
		right: 15%; top: 10%;
		background: #2969ff;
	}
	.blob-gold {
		width: 300px; height: 300px;
		left: 15%; bottom: 0;
		background: #ffd363;
	}
</style>
