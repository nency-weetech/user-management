import http from 'k6/http';

export const options = {
    vus: 1, 
    duration: '10s'
}

export default function(){
    const response = http.get('http://localhost:3100');
    console.log(`Status: ${response.status}`)
}