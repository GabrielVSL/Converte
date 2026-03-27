<script lang="ts">
    import { enhance } from '$app/forms';

    // Lógica original mantida intacta [cite: 23, 24]
    let { form } = $props();
</script>

<div class="relative min-h-screen flex items-center justify-center bg-[#FAFAF9] p-4 font-sans overflow-hidden">
    
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-10 animate-blob"></div>
        <div class="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-10 animate-blob animation-delay-2000"></div>
    </div>

    <div class="relative z-10 w-full max-w-md bg-white p-10 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 animate-fade-up">
        
        <div class="text-center mb-10">
            <div class="w-12 h-12 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span class="text-white text-xl leading-none">🎓</span>
            </div>
            
            <h1 class="text-[2rem] font-extrabold text-[#0F172A] tracking-tight leading-none mb-4">
                Converte!
            </h1>
            
            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                <span class="text-xs">🔒</span>
                <span class="text-xs font-bold text-slate-600 tracking-wide">Acesso restrito à Sheila</span>
            </div>
        </div>

        <form method="POST" use:enhance class="space-y-6">
            
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>

                <input 
                    id="password"
                    name="password" 
                    type="password" 
                    placeholder="Senha Mestra" 
                    class="peer w-full h-14 pl-12 pr-4 pt-5 pb-1 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-900 font-medium placeholder-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                    required
                />
                
                <label 
                    for="password" 
                    class="absolute left-12 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-text transition-all duration-200
                           peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:font-medium
                           peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:font-bold peer-focus:text-indigo-500"
                >
                    Senha Mestra
                </label>
            </div>
            
            {#if form?.error}
                <div class="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-shake-fade flex items-center gap-2">
                    <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    {form.error}
                </div>
            {/if}

            <button class="btn-shimmer relative overflow-hidden w-full py-4 mt-2 bg-[#0F172A] text-white text-sm font-extrabold tracking-wide rounded-2xl hover:bg-[#1e293b] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-slate-900/10">
                <span class="relative z-10">Entrar no Dashboard</span>
            </button>
        </form>
    </div>
</div>

<style>
    /* 1. Page Load Animation */
    @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
        animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* 2. Ambient Background Blobs */
    @keyframes float {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
        animation: float 8s infinite alternate ease-in-out;
    }
    .animation-delay-2000 {
        animation-delay: 2s;
    }

    /* 3. Button Shimmer Sweep Effect */
    .btn-shimmer::after {
        content: '';
        position: absolute;
        top: 0; 
        left: -100%;
        width: 50%; 
        height: 100%;
        background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
        transform: skewX(-20deg);
        z-index: 1;
    }
    .btn-shimmer:hover::after {
        animation: shimmer 0.75s forwards;
    }
    @keyframes shimmer {
        100% { left: 200%; }
    }

    /* 4. Improved Shake + Fade Error Animation */
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