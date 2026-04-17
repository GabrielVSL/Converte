<script lang="ts">
    import { enhance } from '$app/forms';
    let { form } = $props();
</script>

<div class="fixed inset-0 z-0 overflow-hidden bg-slate-950">
    <video
        class="absolute min-w-full min-h-full object-cover opacity-50 mix-blend-luminosity"
        autoplay
        loop
        muted
        playsinline
    >
        <source src="https://res.cloudinary.com/dz7ezv7lo/video/upload/v1776440389/V%C3%ADdeo_Institucional_CSPC_2024_-_Canal_CSPCBHZ_1080p_1_-_Trim_m788gc.mp4" type="video/mp4" />
    </video>
    
    <div class="absolute inset-0 bg-gradient-to-br from-[#00007D]/30 via-slate-900/80 to-slate-950/95"></div>
</div>

<div class="relative z-10 min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden">
    
    <div class="w-full max-w-md bg-white/5 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/10 animate-fade-up">
        
        <div class="text-center mb-10 flex flex-col items-center">
            <img 
                src="https://res.cloudinary.com/dz7ezv7lo/image/upload/v1776439580/S%C3%ADmbolo_nuytdc.png" 
                alt="Logo Converte" 
                class="h-20 w-auto mb-5 drop-shadow-2xl object-contain rounded-xl"
            />
            
            <h1 class="text-[2rem] font-extrabold text-white tracking-tight leading-none mb-4">
                Converte!
            </h1>
            
            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFCC29]/10 border border-[#FFCC29]/30 backdrop-blur-md">
                <span class="text-xs">🔒</span>
                <span class="text-xs font-bold text-[#FFCC29] tracking-wide">Acesso restrito à Sheila</span>
            </div>
        </div>

        <form method="POST" use:enhance class="space-y-6">
            
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#727376] group-focus-within:text-[#FFCC29] transition-colors duration-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>

                <input 
                    id="password"
                    name="password" 
                    type="password" 
                    placeholder="Senha Mestra" 
                    class="peer w-full h-14 pl-12 pr-4 pt-5 pb-1 bg-black/20 border border-white/10 rounded-2xl outline-none text-white font-medium placeholder-transparent focus:bg-black/40 focus:border-[#FFCC29] focus:ring-4 focus:ring-[#FFCC29]/20 transition-all duration-200 shadow-inner"
                    required
                />
                
                <label 
                    for="password" 
                    class="absolute left-12 top-2 text-[10px] font-bold text-[#727376] uppercase tracking-widest cursor-text transition-all duration-200
                           peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:font-medium
                           peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:font-bold peer-focus:text-[#FFCC29]"
                >
                    Senha Mestra
                </label>
            </div>
            
            {#if form?.error}
                <div class="bg-[#BD0000]/20 text-white p-4 rounded-xl text-xs font-bold border border-[#BD0000]/40 animate-shake-fade flex items-center gap-2 backdrop-blur-sm">
                    <svg class="w-4 h-4 shrink-0 text-[#FFCC29]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    {form.error}
                </div>
            {/if}

            <button class="btn-shimmer relative overflow-hidden w-full py-4 mt-2 bg-gradient-to-r from-[#BD0000] to-[#00007D] text-white text-sm font-extrabold tracking-wide rounded-2xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_25px_rgba(189,0,0,0.3)] border border-white/10">
                <span class="relative z-10">Entrar no Dashboard</span>
            </button>
        </form>
    </div>
</div>

<style>
    @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
        animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .btn-shimmer::after {
        content: '';
        position: absolute;
        top: 0; 
        left: -100%;
        width: 50%; 
        height: 100%;
        background: linear-gradient(to right, transparent, rgba(255, 204, 41, 0.2), transparent);
        transform: skewX(-20deg);
        z-index: 1;
    }
    .btn-shimmer:hover::after {
        animation: shimmer 0.75s forwards;
    }
    @keyframes shimmer {
        100% { left: 200%; }
    }

    @keyframes shakeFade {
        0% { transform: translateX(0); opacity: 0; }
        15% { transform: translateX(-6px); opacity: 1; }
        30% { transform: translateX(5px); opacity: 1; }
        45% { transform: translateX(-3px); opacity: 1; }
        60% { transform: translateX(2px); opacity: 1; }
        100% { transform: translateX(0); opacity: 1; }
    }
    .animate-shake-fade {
        animation: shakeFade 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
</style>