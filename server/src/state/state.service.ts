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
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const getCounts = async (model: Model<any>) => ({
      today: await model.countDocuments({ createdAt: { $gte: startOfDay } }),
      thisMonth: await model.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),
      thisYear: await model.countDocuments({
        createdAt: { $gte: startOfYear },
      }),
    });

    const [operateurs, chauffeurs, vehicules] = await Promise.all([
      getCounts(this.operateurModel),
      getCounts(this.chauffeurModel),
      getCounts(this.vehiculeModel),
    ]);

    return { operateurs, chauffeurs, vehicules };
  }

  //inter communal
  async getInter_communal(startDate?: Date, endDate?: Date) {
    const ve = await this.vehiculeModel.findOne({
      font_type: 'بين البلديات'
    })
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
              $cond: [{ $eq: ['$vihicile_parked', 'لا'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'نعم'] }, 1, 0],
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
                {
                  $and: [
                    { $gt: ['$vehicleAge', 5] },
                    { $lte: ['$vehicleAge', 10] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 10] },
                    { $lte: ['$vehicleAge', 15] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 15] },
                    { $lte: ['$vehicleAge', 20] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_20_25: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 20] },
                    { $lte: ['$vehicleAge', 25] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_25_30: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 25] },
                    { $lte: ['$vehicleAge', 30] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_plus_30: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 30] }, 1, 0],
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
          age_20_25: 1,
          age_25_30: 1,
          age_plus_30: 1,
          _id: 0,
        },
      },
    ]);
  }

  //inter wilaya
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
              $cond: [{ $eq: ['$vihicile_parked', 'لا'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'نعم'] }, 1, 0],
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
                {
                  $and: [
                    { $gt: ['$vehicleAge', 5] },
                    { $lte: ['$vehicleAge', 10] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 10] },
                    { $lte: ['$vehicleAge', 15] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 15] },
                    { $lte: ['$vehicleAge', 20] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_20_25: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 20] },
                    { $lte: ['$vehicleAge', 25] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_25_30: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 25] },
                    { $lte: ['$vehicleAge', 30] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_plus_30: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 30] }, 1, 0],
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
          age_20_25: 1,
          age_25_30: 1,
          age_plus_30: 1,
          _id: 0,
        },
      },
    ]);
  }

  //inter rural
  async getInter_rural(startDate, endDate) {
    const matchConditions: any = {
      font_type: 'ريـفي',
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
              $cond: [{ $eq: ['$vihicile_parked', 'لا'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'نعم'] }, 1, 0],
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
                {
                  $and: [
                    { $gt: ['$vehicleAge', 5] },
                    { $lte: ['$vehicleAge', 10] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 10] },
                    { $lte: ['$vehicleAge', 15] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 15] },
                    { $lte: ['$vehicleAge', 20] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_20_25: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 20] },
                    { $lte: ['$vehicleAge', 25] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_25_30: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 25] },
                    { $lte: ['$vehicleAge', 30] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_plus_30: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 30] }, 1, 0],
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
          age_20_25: 1,
          age_25_30: 1,
          age_plus_30: 1,
          _id: 0,
        },
      },
    ]);
  }

  //inter urbain
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
              $cond: [{ $eq: ['$vihicile_parked', 'لا'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'نعم'] }, 1, 0],
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
                {
                  $and: [
                    { $gt: ['$vehicleAge', 5] },
                    { $lte: ['$vehicleAge', 10] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 10] },
                    { $lte: ['$vehicleAge', 15] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 15] },
                    { $lte: ['$vehicleAge', 20] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_20_25: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 20] },
                    { $lte: ['$vehicleAge', 25] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_25_30: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 25] },
                    { $lte: ['$vehicleAge', 30] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_plus_30: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 30] }, 1, 0],
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
          age_20_25: 1,
          age_25_30: 1,
          age_plus_30: 1,
          _id: 0,
        },
      },
    ]);
  }

  //inter scolaire
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
              $cond: [{ $eq: ['$vihicile_parked', 'لا'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'نعم'] }, 1, 0],
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
                {
                  $and: [
                    { $gt: ['$vehicleAge', 5] },
                    { $lte: ['$vehicleAge', 10] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 10] },
                    { $lte: ['$vehicleAge', 15] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 15] },
                    { $lte: ['$vehicleAge', 20] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_20_25: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 20] },
                    { $lte: ['$vehicleAge', 25] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_25_30: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 25] },
                    { $lte: ['$vehicleAge', 30] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_plus_30: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 30] }, 1, 0],
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
          age_20_25: 1,
          age_25_30: 1,
          age_plus_30: 1,
          _id: 0,
        },
      },
    ]);
  }

  async transport_travailleurs(startDate, endDate) {
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
              $cond: [{ $eq: ['$vihicile_parked', 'لا'] }, 1, 0],
            },
          },
          arret: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'نعم'] }, 1, 0],
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
                {
                  $and: [
                    { $gt: ['$vehicleAge', 5] },
                    { $lte: ['$vehicleAge', 10] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_11_15: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 10] },
                    { $lte: ['$vehicleAge', 15] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_15_20: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 15] },
                    { $lte: ['$vehicleAge', 20] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_20_25: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 20] },
                    { $lte: ['$vehicleAge', 25] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_25_30: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$vehicleAge', 25] },
                    { $lte: ['$vehicleAge', 30] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          age_plus_30: {
            $sum: {
              $cond: [{ $gt: ['$vehicleAge', 30] }, 1, 0],
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
          age_20_25: 1,
          age_25_30: 1,
          age_plus_30: 1,
          _id: 0,
        },
      },
    ]);
  }

  //statistisue annee
 async statistiqueAnnee(startDate: Date, endDate: Date) {
    let Operateur = {};
    let Vihicle = {};
    let CAPACITÉ = {};

    // Get vehicles within date range
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const vehicles = await this.vehiculeModel.find(dateFilter);

    // Get unique client IDs from vehicles
    const uniqueClientIds = [
      ...new Set(
        vehicles
          .map(v => v.num_docier_client)
          .filter(Boolean)
      ),
    ];

    // Fetch operators
    const operateurs = await this.operateurModel
      .find({
        num_docier_client: { $in: uniqueClientIds },
      })
      .select('num_docier_client')
      .lean();

    // Create Set for lookup
    const operateurSet = new Set(
      operateurs.map(o => o.num_docier_client)
    );

    // Filter vehicles that have matching operators
    const vehiclesWithOperators = vehicles.filter(v => 
      v.num_docier_client && operateurSet.has(v.num_docier_client)
    );

    /** ------------ 1. Operateur (عدد المتعاملين - UNIQUE COUNT) ------------- **/
    
    // Get UNIQUE num_docier_client for TPV
    const tpvVehicles = vehiclesWithOperators.filter((v) =>
      ['بين البلديات', 'بين الولايات', 'حضري أو شبه حضري', 'ريفي'].includes(v.font_type),
    );
    
    const tpvUniquePublic = new Set(
      tpvVehicles
        .filter(v => v.status_activite === 'PUBLIC')
        .map(v => v.num_docier_client)
    );
    
    const tpvUniquePrive = new Set(
      tpvVehicles
        .filter(v => v.status_activite === 'PRIVE')
        .map(v => v.num_docier_client)
    );
    
    const tpvUniqueTotal = new Set(
      tpvVehicles.map(v => v.num_docier_client)
    );

    // Get UNIQUE num_docier_client for TPC
    const tpcVehicles = vehiclesWithOperators.filter((v) =>
      ['نقل مدرسي', 'نقل العمال'].includes(v.font_type),
    );
    
    const tpcUniquePublic = new Set(
      tpcVehicles
        .filter(v => v.status_activite === 'PUBLIC')
        .map(v => v.num_docier_client)
    );
    
    const tpcUniquePrive = new Set(
      tpcVehicles
        .filter(v => v.status_activite === 'PRIVE')
        .map(v => v.num_docier_client)
    );
    
    const tpcUniqueTotal = new Set(
      tpcVehicles.map(v => v.num_docier_client)
    );

    // Total UNIQUE operators (combining both TPV and TPC)
    const allUniqueOperators = new Set([
      ...tpvUniqueTotal,
      ...tpcUniqueTotal
    ]);

    Operateur = {
      transport_public_voyageurs: {
        total: tpvUniqueTotal.size,        // UNIQUE count
        public: tpvUniquePublic.size,      // UNIQUE count
        prive: tpvUniquePrive.size,        // UNIQUE count
      },
      transport_propre_compte: {
        total: tpcUniqueTotal.size,        // UNIQUE count
        pubC: tpcUniquePublic.size,        // UNIQUE count
        PrvC: tpcUniquePrive.size,         // UNIQUE count
      },
      total: allUniqueOperators.size,      // UNIQUE count
    };

    /** ------------ 2. Vehicle (عدد المركبات) ------------- **/
    const tpvVichecle = vehicles.filter((v) =>
      ['بين البلديات', 'بين الولايات', 'حضري أو شبه حضري', 'ريفي'].includes(v.font_type),
    );

    const publicCounVichecle = tpvVichecle.filter(
      (v) => v.status_activite === 'PUBLIC',
    ).length;
    
    const priveCountVichecle = tpvVichecle.filter(
      (v) => v.status_activite === 'PRIVE',
    ).length;

    const tpcVichecle = vehicles.filter((v) =>
      ['نقل مدرسي', 'نقل العمال'].includes(v.font_type),
    );

    const cPubVichecle = tpcVichecle.filter(
      (c) => c.status_activite === 'PUBLIC',
    ).length;
    
    const cPrvVichecle = tpcVichecle.filter(
      (c) => c.status_activite === 'PRIVE',
    ).length;

    const totalVichecle = tpcVichecle.length + tpvVichecle.length;

    Vihicle = {
      transport_public_voyageurs: {
        total: tpvVichecle.length,
        public: publicCounVichecle,
        prive: priveCountVichecle,
      },
      transport_propre_compte: {
        total: tpcVichecle.length,
        pubC: cPubVichecle,
        PrvC: cPrvVichecle,
      },
      totalVichecle,
    };

    /** ------------ 3. CAPACITÉ (مجموع المقاعد) ------------- **/
    const tpvNP = vehicles.filter((v) =>
      ['بين البلديات', 'بين الولايات', 'حضري أو شبه حضري', 'ريفي'].includes(v.font_type),
    );

    const publicCountNP = tpvNP
      .filter((v) => v.status_activite === 'PUBLIC' && v.Number_of_seats)
      .reduce((sum, v) => sum + (Number(v.Number_of_seats) || 0), 0);

    const priveCountNP = tpvNP
      .filter((v) => v.status_activite === 'PRIVE' && v.Number_of_seats)
      .reduce((sum, v) => sum + (Number(v.Number_of_seats) || 0), 0);

    const tpcNP = vehicles.filter((v) =>
      ['نقل مدرسي', 'نقل العمال'].includes(v.font_type),
    );

    const cPubNP = tpcNP
      .filter((c) => c.status_activite === 'PUBLIC' && c.Number_of_seats)
      .reduce((sum, v) => sum + (Number(v.Number_of_seats) || 0), 0);
    
    const cPrvNP = tpcNP
      .filter((c) => c.status_activite === 'PRIVE' && c.Number_of_seats)
      .reduce((sum, v) => sum + (Number(v.Number_of_seats) || 0), 0);
    
    const total_tpv = tpvNP.reduce(
      (sum, v) => sum + (Number(v.Number_of_seats) || 0),
      0,
    );
    
    const total_tpc = tpcNP.reduce(
      (sum, v) => sum + (Number(v.Number_of_seats) || 0),
      0,
    );
    
    const totalNP = total_tpv + total_tpc;

    CAPACITÉ = {
      transport_public_voyageurs: {
        total: total_tpv,
        public: publicCountNP,
        prive: priveCountNP,
      },
      transport_propre_compte: {
        total: total_tpc,
        pubC: cPubNP,
        PrvC: cPrvNP,
      },
      totalNP,
    };

    return {
      Operateur,
      Vihicle,
      CAPACITÉ,
    };
  }


}
