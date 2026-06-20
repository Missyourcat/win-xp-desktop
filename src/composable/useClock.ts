import { ref, onMounted, onUnmounted } from 'vue'

export function useClock() {
    const time = ref('')

    let timer: number | null = null

    function update() {
        const now = new Date()

        time.value = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    onMounted(() => {
        update()
        timer = window.setInterval(update, 1000)
    })

    onUnmounted(() => {
        if (timer) {
            clearInterval(timer)
        }
    })

    return {
        time
    }
}