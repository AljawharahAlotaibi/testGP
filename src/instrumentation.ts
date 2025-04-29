import connect from '@/lib/db'

export async function register(): Promise<void> {
    await connect();
}
