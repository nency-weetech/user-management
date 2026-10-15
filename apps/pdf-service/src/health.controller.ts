import { Controller, Get, UseGuards } from "@nestjs/common";
import { ServiceKeyGuard } from "./security/service-key.guard";

//@UseGuards(ServiceKeyGuard)
@Controller('health')
export class HealthController {
    @Get()
    health(){
        return {ok: true}
    }
}