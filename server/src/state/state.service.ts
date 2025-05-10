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

  async getInter_communal(startDate?: Date, endDate?: Date) {
    const matchConditions: any = {
      font_type: 'بين البلديات',
    };

    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return this.vehiculeModel.aggregate([
      {
        $addFields: {
          uniqueTrafficPoints: {
            $setUnion: [
              [],
              [
                '$point_Traffic1',
                '$point_Traffic2',
                '$point_Traffic3',
                '$point_Traffic4',
                '$point_Traffic5',
              ],
            ],
          },
        },
      },
      {
        $addFields: {
          trafficPointsCount: {
            $size: {
              $filter: {
                input: '$uniqueTrafficPoints',
                as: 'point',
                cond: { $ne: ['$$point', ''] },
              },
            },
          },
          vehicleAge: {
            $subtract: [
              { $year: new Date() },
              {
                $convert: {
                  input: '$First_year_of_use',
                  to: 'int',
                  onError: 0,
                  onNull: 0,
                },
              },
            ],
          },
        },
      },
      {
        $match: matchConditions,
      },
      {
        $group: {
          _id: '$font_type',
          nbVehicules: { $sum: 1 },
          nbPlaces: { $sum: '$Number_of_seats' },
          uniqueClients: { $addToSet: '$num_docier_client' },
          totalAge: { $sum: '$vehicleAge' },
          en_activite: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'في الخدمة'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'موقفة'] }, 1, 0],
            },
          },
          totalTrajets: { $sum: '$trafficPointsCount' },
          age_0_5: {
            $sum: {
              $cond: [{ $lte: ['$vehicleAge', 5] }, 1, 0],
            },
          },
          age_6_10: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 5] }, { $lte: ['$vehicleAge', 10] }] },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 10] }, { $lte: ['$vehicleAge', 15] }] },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 15] }, { $lte: ['$vehicleAge', 20] }] },
                1,
                0,
              ],
            },
          },
          age_plus_20: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 20] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          type: '$_id',
          nbVehicules: 1,
          nbPlaces: 1,
          nbOperators: { $size: '$uniqueClients' },
          avgAge: {
            $cond: [
              { $eq: ['$nbVehicules', 0] },
              0,
              { $divide: ['$totalAge', '$nbVehicules'] },
            ],
          },
          en_activite: 1,
          arret: 1,
          totalTrajets: 1,
          age_0_5: 1,
          age_6_10: 1,
          age_11_15: 1,
          age_15_20: 1,
          age_plus_20: 1,
          _id: 0,
        },
      },
    ]);
  }





  async getInter_wilaya(startDate, endDate) {
    const matchConditions: any = {
      font_type: 'بين الولايات',
    };

    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return this.vehiculeModel.aggregate([
      {
        $addFields: {
          uniqueTrafficPoints: {
            $setUnion: [
              [],
              [
                '$point_Traffic1',
                '$point_Traffic2',
                '$point_Traffic3',
                '$point_Traffic4',
                '$point_Traffic5',
              ],
            ],
          },
        },
      },
      {
        $addFields: {
          trafficPointsCount: {
            $size: {
              $filter: {
                input: '$uniqueTrafficPoints',
                as: 'point',
                cond: { $ne: ['$$point', ''] },
              },
            },
          },
        },
      },
      {
        $match: matchConditions
      },
      {
        $group: {
          _id: '$font_type',
          nbVehicules: { $sum: 1 },
          nbPlaces: { $sum: '$Number_of_seats' },
          uniqueClients: { $addToSet: '$num_docier_client' },
          totalAge: {
            $sum: {
              $subtract: [
                { $year: new Date() },
                {
                  $convert: {
                    input: '$First_year_of_use',
                    to: 'int',
                    onError: 0,
                    onNull: 0,
                  },
                },
              ],
            },
          },
          en_activite: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'في الخدمة'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'موقفة'] }, 1, 0],
            },
          },
          totalTrajets: { $sum: '$trafficPointsCount' },
          age_0_5: {
            $sum: {
              $cond: [{ $lte: ['$vehicleAge', 5] }, 1, 0],
            },
          },
          age_6_10: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 5] }, { $lte: ['$vehicleAge', 10] }] },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 10] }, { $lte: ['$vehicleAge', 15] }] },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 15] }, { $lte: ['$vehicleAge', 20] }] },
                1,
                0,
              ],
            },
          },
          age_plus_20: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 20] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          type: '$_id',
          nbVehicules: 1,
          nbPlaces: 1,
          nbOperators: { $size: '$uniqueClients' },
          avgAge: {
            $cond: [
              { $eq: ['$nbVehicules', 0] },
              0,
              { $divide: ['$totalAge', '$nbVehicules'] },
            ],
          },
          en_activite: 1,
          arret: 1,
          totalTrajets: 1,
          age_0_5: 1,
          age_6_10: 1,
          age_11_15: 1,
          age_15_20: 1,
          age_plus_20: 1,
          _id: 0,
        },
      },
    ]);
  }


  async getInter_rural(startDate, endDate) {
    const matchConditions: any = {
      font_type: 'ريفي',
    };

    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    return this.vehiculeModel.aggregate([
      {
        $addFields: {
          uniqueTrafficPoints: {
            $setUnion: [
              [],
              [
                '$point_Traffic1',
                '$point_Traffic2',
                '$point_Traffic3',
                '$point_Traffic4',
                '$point_Traffic5',
              ],
            ],
          },
        },
      },
      {
        $addFields: {
          trafficPointsCount: {
            $size: {
              $filter: {
                input: '$uniqueTrafficPoints',
                as: 'point',
                cond: { $ne: ['$$point', ''] },
              },
            },
          },
        },
      },
      {
        $match: matchConditions
      },
      {
        $group: {
          _id: '$font_type',
          nbVehicules: { $sum: 1 },
          nbPlaces: { $sum: '$Number_of_seats' },
          uniqueClients: { $addToSet: '$num_docier_client' },
          totalAge: {
            $sum: {
              $subtract: [
                { $year: new Date() },
                {
                  $convert: {
                    input: '$First_year_of_use',
                    to: 'int',
                    onError: 0,
                    onNull: 0,
                  },
                },
              ],
            },
          },
          en_activite: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'في الخدمة'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'موقفة'] }, 1, 0],
            },
          },
          totalTrajets: { $sum: '$trafficPointsCount' },
          age_0_5: {
            $sum: {
              $cond: [{ $lte: ['$vehicleAge', 5] }, 1, 0],
            },
          },
          age_6_10: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 5] }, { $lte: ['$vehicleAge', 10] }] },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 10] }, { $lte: ['$vehicleAge', 15] }] },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 15] }, { $lte: ['$vehicleAge', 20] }] },
                1,
                0,
              ],
            },
          },
          age_plus_20: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 20] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          type: '$_id',
          nbVehicules: 1,
          nbPlaces: 1,
          nbOperators: { $size: '$uniqueClients' },
          avgAge: {
            $cond: [
              { $eq: ['$nbVehicules', 0] },
              0,
              { $divide: ['$totalAge', '$nbVehicules'] },
            ],
          },
          en_activite: 1,
          arret: 1,
          totalTrajets: 1,
          age_0_5: 1,
          age_6_10: 1,
          age_11_15: 1,
          age_15_20: 1,
          age_plus_20: 1,
          _id: 0,
        },
      },
    ]);
  }


  async getInter_urbain(startDate, endDate) {
    const matchConditions: any = {
      font_type: 'نقل العمال',
    };

    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    return this.vehiculeModel.aggregate([
      {
        $addFields: {
          uniqueTrafficPoints: {
            $setUnion: [
              [],
              [
                '$point_Traffic1',
                '$point_Traffic2',
                '$point_Traffic3',
                '$point_Traffic4',
                '$point_Traffic5',
              ],
            ],
          },
        },
      },
      {
        $addFields: {
          trafficPointsCount: {
            $size: {
              $filter: {
                input: '$uniqueTrafficPoints',
                as: 'point',
                cond: { $ne: ['$$point', ''] },
              },
            },
          },
        },
      },
      {
        $match: matchConditions
      },
      {
        $group: {
          _id: '$font_type',
          nbVehicules: { $sum: 1 },
          nbPlaces: { $sum: '$Number_of_seats' },
          uniqueClients: { $addToSet: '$num_docier_client' },
          totalAge: {
            $sum: {
              $subtract: [
                { $year: new Date() },
                {
                  $convert: {
                    input: '$First_year_of_use',
                    to: 'int',
                    onError: 0,
                    onNull: 0,
                  },
                },
              ],
            },
          },
          en_activite: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'في الخدمة'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'موقفة'] }, 1, 0],
            },
          },
          totalTrajets: { $sum: '$trafficPointsCount' },
          age_0_5: {
            $sum: {
              $cond: [{ $lte: ['$vehicleAge', 5] }, 1, 0],
            },
          },
          age_6_10: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 5] }, { $lte: ['$vehicleAge', 10] }] },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 10] }, { $lte: ['$vehicleAge', 15] }] },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 15] }, { $lte: ['$vehicleAge', 20] }] },
                1,
                0,
              ],
            },
          },
          age_plus_20: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 20] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          type: '$_id',
          nbVehicules: 1,
          nbPlaces: 1,
          nbOperators: { $size: '$uniqueClients' },
          avgAge: {
            $cond: [
              { $eq: ['$nbVehicules', 0] },
              0,
              { $divide: ['$totalAge', '$nbVehicules'] },
            ],
          },
          en_activite: 1,
          arret: 1,
          totalTrajets: 1,
          age_0_5: 1,
          age_6_10: 1,
          age_11_15: 1,
          age_15_20: 1,
          age_plus_20: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getInter_scolaire(startDate, endDate) {
    const matchConditions: any = {
      font_type: 'نقل مدرسي',
    };

    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    return this.vehiculeModel.aggregate([
      {
        $addFields: {
          uniqueTrafficPoints: {
            $setUnion: [
              [],
              [
                '$point_Traffic1',
                '$point_Traffic2',
                '$point_Traffic3',
                '$point_Traffic4',
                '$point_Traffic5',
              ],
            ],
          },
        },
      },
      {
        $addFields: {
          trafficPointsCount: {
            $size: {
              $filter: {
                input: '$uniqueTrafficPoints',
                as: 'point',
                cond: { $ne: ['$$point', ''] },
              },
            },
          },
        },
      },
      {
        $match: matchConditions
      },
      {
        $group: {
          _id: '$font_type',
          nbVehicules: { $sum: 1 },
          nbPlaces: { $sum: '$Number_of_seats' },
          uniqueClients: { $addToSet: '$num_docier_client' },
          totalAge: {
            $sum: {
              $subtract: [
                { $year: new Date() },
                {
                  $convert: {
                    input: '$First_year_of_use',
                    to: 'int',
                    onError: 0,
                    onNull: 0,
                  },
                },
              ],
            },
          },
          en_activite: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'في الخدمة'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'موقفة'] }, 1, 0],
            },
          },
          totalTrajets: { $sum: '$trafficPointsCount' },
          age_0_5: {
            $sum: {
              $cond: [{ $lte: ['$vehicleAge', 5] }, 1, 0],
            },
          },
          age_6_10: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 5] }, { $lte: ['$vehicleAge', 10] }] },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 10] }, { $lte: ['$vehicleAge', 15] }] },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$vehicleAge', 15] }, { $lte: ['$vehicleAge', 20] }] },
                1,
                0,
              ],
            },
          },
          age_plus_20: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 20] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          type: '$_id',
          nbVehicules: 1,
          nbPlaces: 1,
          nbOperators: { $size: '$uniqueClients' },
          avgAge: {
            $cond: [
              { $eq: ['$nbVehicules', 0] },
              0,
              { $divide: ['$totalAge', '$nbVehicules'] },
            ],
          },
          en_activite: 1,
          arret: 1,
          totalTrajets: 1,
          age_0_5: 1,
          age_6_10: 1,
          age_11_15: 1,
          age_15_20: 1,
          age_plus_20: 1,
          _id: 0,
        },
      },
    ]);
  }

}
