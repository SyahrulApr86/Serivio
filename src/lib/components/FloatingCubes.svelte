<script lang="ts">
	const cubes = [
		{
			size: 78, half: 39,
			top:    'linear-gradient(145deg, #ffc4ec 0%, #f75cc3 55%, #d940a8 100%)',
			front:  'radial-gradient(ellipse at 38% 32%, #ffaadf 0%, #f75cc3 50%, #e040b0 100%)',
			right:  'linear-gradient(175deg, #c830a0 0%, #9e1880 100%)',
			left:   'linear-gradient(175deg, #b02890 0%, #881060 100%)',
			bottom: '#700040',
			back:   '#f75cc388',
			shadow: '#f75cc355',
			x: -80, y: 12, dur: 10, delay: 0
		},
		{
			size: 56, half: 28,
			top:    'linear-gradient(145deg, #90c0ff 0%, #2969ff 55%, #1450e0 100%)',
			front:  'radial-gradient(ellipse at 38% 32%, #88b8ff 0%, #2969ff 50%, #1250d8 100%)',
			right:  'linear-gradient(175deg, #1040c0 0%, #082898 100%)',
			left:   'linear-gradient(175deg, #0c38a8 0%, #061880 100%)',
			bottom: '#041060',
			back:   '#2969ff88',
			shadow: '#2969ff44',
			x: 62, y: 54, dur: 7.5, delay: -2.8
		},
		{
			size: 42, half: 21,
			top:    'linear-gradient(145deg, #ffe9a0 0%, #ffd363 55%, #e0a820 100%)',
			front:  'radial-gradient(ellipse at 38% 32%, #ffe080 0%, #ffd363 50%, #e0a820 100%)',
			right:  'linear-gradient(175deg, #c88810 0%, #a06010 100%)',
			left:   'linear-gradient(175deg, #b07010 0%, #885000 100%)',
			bottom: '#704000',
			back:   '#ffd36388',
			shadow: '#ffd36344',
			x: -10, y: 96, dur: 13.5, delay: -5.5
		}
	];

	const faceOrder = ['front', 'back', 'left', 'right', 'top', 'bottom'] as const;
</script>

<div class="stage" aria-hidden="true">
	{#each cubes as c, i}
		<div
			class="cube cube-{i}"
			style="
				width:{c.size}px;height:{c.size}px;
				left:calc(50% + {c.x}px);top:{c.y}px;
				animation-duration:{c.dur}s;
				animation-delay:{c.delay}s;
			"
		>
			<div class="face" style="background:{c.front};transform:translateZ({c.half}px)"></div>
			<div class="face" style="background:{c.back};transform:rotateY(180deg) translateZ({c.half}px)"></div>
			<div class="face" style="background:{c.left};transform:rotateY(-90deg) translateZ({c.half}px)"></div>
			<div class="face" style="background:{c.right};transform:rotateY(90deg) translateZ({c.half}px)"></div>
			<div class="face" style="background:{c.top};transform:rotateX(90deg) translateZ({c.half}px)"></div>
			<div class="face" style="background:{c.bottom};transform:rotateX(-90deg) translateZ({c.half}px)"></div>
		</div>
		<!-- soft glow shadow -->
		<div class="shadow" style="
			left:calc(50% + {c.x + c.size * 0.1}px);
			top:{c.y + c.size * 1.35}px;
			width:{c.size * 0.8}px;
			background:radial-gradient(ellipse, {c.shadow} 0%, transparent 70%);
			animation-duration:{c.dur}s;
			animation-delay:{c.delay}s;
		"></div>
	{/each}
</div>

<style>
	.stage {
		position: relative;
		height: 220px;
		perspective: 1000px;
		perspective-origin: 50% 35%;
	}

	.face {
		position: absolute;
		inset: 0;
		border-radius: 9px;
	}

	.cube {
		position: absolute;
		transform-style: preserve-3d;
	}

	/* Each cube: combined float + Y spin in one animation so they compose correctly */
	.cube-0 { animation: spin0 10s linear infinite; }
	.cube-1 { animation: spin1 7.5s linear infinite; }
	.cube-2 { animation: spin2 13.5s linear infinite; }

	@keyframes spin0 {
		0%   { transform: translateY(0px)   rotateX(24deg) rotateY(0deg);   }
		25%  { transform: translateY(-16px) rotateX(24deg) rotateY(90deg);  }
		50%  { transform: translateY(-22px) rotateX(24deg) rotateY(180deg); }
		75%  { transform: translateY(-16px) rotateX(24deg) rotateY(270deg); }
		100% { transform: translateY(0px)   rotateX(24deg) rotateY(360deg); }
	}
	@keyframes spin1 {
		0%   { transform: translateY(0px)   rotateX(20deg) rotateY(0deg);    }
		25%  { transform: translateY(-14px) rotateX(20deg) rotateY(-90deg);  }
		50%  { transform: translateY(-20px) rotateX(20deg) rotateY(-180deg); }
		75%  { transform: translateY(-14px) rotateX(20deg) rotateY(-270deg); }
		100% { transform: translateY(0px)   rotateX(20deg) rotateY(-360deg); }
	}
	@keyframes spin2 {
		0%   { transform: translateY(0px)   rotateX(28deg) rotateY(0deg);   }
		25%  { transform: translateY(-12px) rotateX(28deg) rotateY(90deg);  }
		50%  { transform: translateY(-18px) rotateX(28deg) rotateY(180deg); }
		75%  { transform: translateY(-12px) rotateX(28deg) rotateY(270deg); }
		100% { transform: translateY(0px)   rotateX(28deg) rotateY(360deg); }
	}

	.shadow {
		position: absolute;
		height: 18px;
		border-radius: 50%;
		animation: shadow-pulse linear infinite;
	}
	@keyframes shadow-pulse {
		0%, 100% { opacity: 0.7; transform: scaleX(1);    }
		50%       { opacity: 0.3; transform: scaleX(0.65); }
	}
</style>
