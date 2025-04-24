import { Injectable } from '@nestjs/common';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Operateur } from 'src/operateur-dtw/operateur-dtw.schema';
import { Chauffeur } from 'src/chauffeurs/chauffeurs.schema';
import { Vihicles } from 'src/vehicles/vihicles.schema';

@Injectable()
export class StateService {
  constructor(
    @InjectModel(Operateur.name) private operateurModel: Model<Operateur>,
    @InjectModel(Chauffeur.name) private chauffeurModel: Model<Chauffeur>,
    @InjectModel(Vihicles.name) private vehiculeModel: Model<Vihicles>,
  ) { }
  async getAllStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const getCounts = async (model: Model<any>) => ({
      today: await model.countDocuments({ createdAt: { $gte: startOfDay } }),
      thisMonth: await model.countDocuments({ createdAt: { $gte: startOfMonth } }),
      thisYear: await model.countDocuments({ createdAt: { $gte: startOfYear } }),
    });

    const [operateurs, chauffeurs, vehicules] = await Promise.all([
      getCounts(this.operateurModel),
      getCounts(this.chauffeurModel),
      getCounts(this.vehiculeModel),
    ]);

    return { operateurs, chauffeurs, vehicules };
  }
}
