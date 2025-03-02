

async function request(url: string, method: string, body?: any) {
    const token = localStorage.getItem('Client_token');
    const session = localStorage.getItem('Client_session');
    const options: RequestInit = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Session': session ?? '',
        },
        body: body ? JSON.stringify(body) : undefined,
        mode: 'cors',
    }
    const res = await fetch(url, options);
    if (res.status === 200) {
        const headers = res.headers;
        const session = headers.get('X-Session');
        if (session) {
            localStorage.setItem('Client_session', session);
        }
    }
    return res;
}

export default request;


