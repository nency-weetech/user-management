import { INestApplication } from "@nestjs/common"
import Redis from "ioredis";
import { Socket } from "socket.io-client";
import { setUpSocketApp } from "./utils/setup-socket-app";
import { cleanDatabase } from "./utils/db-cleanup";
import { cleanRedis } from "./utils/redis-cleanup";
import { closeTestApp } from "./utils/setup-app";
import { addTestMember, connectSocket, createTestRoom, createUserAndGetToken, waitForEvent } from "./utils/socket-test-helper";

describe('Chat Typing Indicatore (e2e)', () =>{
    let app: INestApplication;
    let baseUrl : string;
    let sockets: Socket[] =[];
    let redis: Redis;

    beforeAll(async() => {
        ({app, baseUrl}= await setUpSocketApp());
        redis = new Redis({host: 'localhost', port: 6379, db: 1});
    });

    afterEach(async () => {
        sockets.forEach((s) => s.disconnect());
        sockets = []

        await cleanDatabase(app);
        await cleanRedis(redis);
    });

    afterAll(async () =>{
        await redis.quit();
        await closeTestApp(app);
    });

    async function setUpTwoUserInOneRoom(){
        const userA = await createUserAndGetToken(app, 'userA@test.com')
        const room = await createTestRoom(app, userA.userId, 'General')

        const userB = await createUserAndGetToken(app, 'userB@test.com')
        await addTestMember(app, userB.userId, room.id);

        const socketA = connectSocket(baseUrl, userA.accessToken);
        const socketB = connectSocket(baseUrl, userB.accessToken);

        sockets.push(socketA, socketB);

        await waitForEvent(socketA, 'connect');
        await waitForEvent(socketB, 'connect');

        socketA.emit('join_room', {roomId: room.id})
        await waitForEvent(socketA, 'room_joined');

        socketB.emit('join_room', {roomId: room.id})
        await waitForEvent(socketB, 'room_joined');

        return {userA, userB, room, socketA, socketB}
    }
    it('broadcasts typing_start to others in the room, but not to the sender', async () =>{
        const {userA, userB, room, socketA, socketB} = await setUpTwoUserInOneRoom();

        const bReceivedPromise = waitForEvent<{userId: string, userName: string}>(socketB, 'user_typing');

        let aRecivedOwnEcho = false;
        socketA.once('user_typing', ()=>{
            aRecivedOwnEcho = true;
        });

        socketA.emit('typing_start', {roomId: room.id})
        const bReceived = await bReceivedPromise;

        expect(bReceived.userId).toBe(userA.userId);
        expect(aRecivedOwnEcho).toBe(false)
    })
    it('broadcasts typing_stop to others in the room', async () =>{
        const {userA, userB, room, socketA, socketB} = await setUpTwoUserInOneRoom();

        const bReceivedStopPromise = waitForEvent<{userId: string}>(socketB, 'user_stopped_typing');

        socketA.emit('typing_stop', {roomId: room.id});

        const bReceived = await bReceivedStopPromise;

        expect(bReceived.userId).toBe(userA.userId);
    })
    
})