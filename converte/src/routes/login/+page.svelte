<script lang="ts">
    import { enhance } from '$app/forms';

    // No Svelte 5, as "props" que vêm do +page.server.ts
    // agora são recebidas através da rune $props()
    let { form } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
    <div class="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-black text-slate-900 tracking-tight">Converte!</h1>
            <p class="text-slate-500 text-sm mt-2 font-medium">Acesso restrito à Sheila</p>
        </div>

        <form method="POST" use:enhance class="space-y-6">
            <div class="space-y-2">
                <label for="password" class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha Mestra</label>
                <input 
                    id="password"
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    required
                />
            </div>
            
            {#if form?.error}
                <div class="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-shake">
                    ⚠️ {form.error}
                </div>
            {/if}

            <button class="w-full py-4 bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200">
                Entrar no Dashboard
            </button>
        </form>
    </div>
</div>

<style>
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
</style>