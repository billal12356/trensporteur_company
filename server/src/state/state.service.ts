import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
      $or: [
        { vihicile_parked: 'لا' },
        {
          $and: [
            { type_parked: 'نعم' },
            { vihicile_parked: 'مؤقت' },
          ],
        },
      ],
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
      $or: [
        { vihicile_parked: 'لا' },
        {
          $and: [
            { type_parked: 'نعم' },
            { vihicile_parked: 'مؤقت' },
          ],
        },
      ],
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
      $or: [
        { vihicile_parked: 'لا' },
        {
          $and: [
            { type_parked: 'نعم' },
            { vihicile_parked: 'مؤقت' },
          ],
        },
      ],
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
      font_type: 'حضري أو شبه حضري',
      $nor: [
        {
          vihicile_parked: 'نعم',
          type_parked: 'نهائي',
        },
      ],
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
      $or: [
        { vihicile_parked: 'لا' },
        {
          $and: [
            { type_parked: 'نعم' },
            { vihicile_parked: 'مؤقت' },
          ],
        },
      ],
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
      $or: [
        { vihicile_parked: 'لا' },
        {
          $and: [
            { type_parked: 'نعم' },
            { vihicile_parked: 'مؤقت' },
          ],
        },
      ],
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
    try {
      let Operateur = {};
      let Vihicle = {};
      let CAPACITÉ = {};


      // Get vehicles within date range
      const dateFilter: any = {
        $or: [
          { vihicile_parked: 'لا' },
          {
            $and: [
              { type_parked: 'نعم' },
              { vihicile_parked: 'مؤقت' },
            ],
          },
        ],
      };

      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: startDate,
          $lt: endDate,
        };
      }

      const vehicles = await this.vehiculeModel.find(dateFilter);
      console.log('📊 Total vehicles found:', vehicles.length);

      if (!vehicles || vehicles.length === 0) {
        return {
          Operateur: {
            transport_public_voyageurs: { total: 0, public: 0, prive: 0 },
            transport_propre_compte: { total: 0, pubC: 0, PrvC: 0 },
            total: 0,
          },
          Vihicle: {
            transport_public_voyageurs: { total: 0, public: 0, prive: 0 },
            transport_propre_compte: { total: 0, pubC: 0, PrvC: 0 },
            totalVichecle: 0,
          },
          CAPACITÉ: {
            transport_public_voyageurs: { total: 0, public: 0, prive: 0 },
            transport_propre_compte: { total: 0, pubC: 0, PrvC: 0 },
            totalNP: 0,
          },
        };
      }

      // Get unique client IDs from vehicles (no duplicates)
      const uniqueClientIds = [
        ...new Set(
          vehicles
            .map(v => v.num_docier_client)
            .filter(Boolean) // Remove null/undefined
        ),
      ];
      console.log('🔢 Unique client IDs from vehicles:', uniqueClientIds.length);

      // Fetch operators that exist in the operators collection
      const operateurs = await this.operateurModel
        .find({
          num_docier_client: { $in: uniqueClientIds },
        })
        .select('num_docier_client')
        .lean();

      console.log('👥 Operators found in collection:', operateurs.length);
      console.log('⚠️ Discrepancy check:', operateurs.length > uniqueClientIds.length ? 'DUPLICATE OPERATORS!' : 'OK');

      // ✅ FIX: Remove duplicate operators
      const operateurSet = new Set(
        operateurs.map(o => o.num_docier_client)
      );
      console.log('✅ Unique operators (after deduplication):', operateurSet.size);

      // Filter vehicles that have matching operators
      const vehiclesWithOperators = vehicles.filter(v =>
        v.num_docier_client && operateurSet.has(v.num_docier_client)
      );
      console.log('🚗 Vehicles with valid operators:', vehiclesWithOperators.length);

      // ✅ Check vehicles without operators
      const vehiclesWithoutOperators = vehicles.filter(v =>
        !v.num_docier_client || !operateurSet.has(v.num_docier_client)
      );
      console.log('⚠️ Vehicles WITHOUT operators:', vehiclesWithoutOperators.length);

      if (vehiclesWithoutOperators.length > 0) {
        const missingIds = [...new Set(vehiclesWithoutOperators.map(v => v.num_docier_client))];
        console.log('❌ Missing operator IDs:', missingIds.slice(0, 10)); // Show first 10
      }

      /** ------------ 1. Operateur (عدد المتعاملين - UNIQUE COUNT) ------------- **/

      // TPV: Transport Public Voyageurs
      const tpvVehicles = vehiclesWithOperators.filter((v) =>
        ['بين البلديات', 'بين الولايات', 'حضري أو شبه حضري', 'ريفي', 'ريـفي'].includes(v.font_type),
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

      // TPC: Transport Propre Compte
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

      console.log('📊 TPV Unique Operators:', tpvUniqueTotal.size);
      console.log('   - Public:', tpvUniquePublic.size);
      console.log('   - Private:', tpvUniquePrive.size);
      console.log('📊 TPC Unique Operators:', tpcUniqueTotal.size);
      console.log('   - Public:', tpcUniquePublic.size);
      console.log('   - Private:', tpcUniquePrive.size);
      console.log('📊 Total Unique Operators (TPV + TPC):', allUniqueOperators.size);

      // Check for operators not in TPV or TPC
      const operatorsNotInCategories = [...operateurSet].filter(
        id => !allUniqueOperators.has(id)
      );
      console.log('⚠️ Operators not in TPV/TPC categories:', operatorsNotInCategories.length);

      Operateur = {
        transport_public_voyageurs: {
          total: tpvUniqueTotal.size,
          public: tpvUniquePublic.size,
          prive: tpvUniquePrive.size,
        },
        transport_propre_compte: {
          total: tpcUniqueTotal.size,
          pubC: tpcUniquePublic.size,
          PrvC: tpcUniquePrive.size,
        },
        total: allUniqueOperators.size,
      };

      /** ------------ 2. Vehicle (عدد المركبات) ------------- **/
      const tpvVichecle = vehiclesWithOperators.filter((v) =>
        ['بين البلديات', 'بين الولايات', 'حضري أو شبه حضري', 'ريفي', 'ريـفي'].includes(v.font_type),
      );

      const publicCounVichecle = tpvVichecle.filter(
        (v) => v.status_activite === 'PUBLIC',
      ).length;

      const priveCountVichecle = tpvVichecle.filter(
        (v) => v.status_activite === 'PRIVE',
      ).length;

      const tpcVichecle = vehiclesWithOperators.filter((v) =>
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
      const tpvNP = vehiclesWithOperators.filter((v) =>
        ['بين البلديات', 'بين الولايات', 'حضري أو شبه حضري', 'ريفي', 'ريـفي'].includes(v.font_type),
      );

      const publicCountNP = tpvNP
        .filter((v) => v.status_activite === 'PUBLIC' && v.Number_of_seats)
        .reduce((sum, v) => sum + (Number(v.Number_of_seats) || 0), 0);

      const priveCountNP = tpvNP
        .filter((v) => v.status_activite === 'PRIVE' && v.Number_of_seats)
        .reduce((sum, v) => sum + (Number(v.Number_of_seats) || 0), 0);

      const tpcNP = vehiclesWithOperators.filter((v) =>
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

      console.log('✅ Statistics calculated successfully');

      return {
        Operateur,
        Vihicle,
        CAPACITÉ,
      };

    } catch (error) {
      console.error('❌ Error in statistiqueAnnee:', error);
      throw new InternalServerErrorException({
        message: 'حدث خطأ أثناء حساب الإحصائيات',
        error: error.message,
      });
    }
  }

  // =====================================================================
  // Canevas n°01: TRANSPORT ROUTIER DE VOYAGEURS
  // =====================================================================

  private classifyVehicleCategory(seats: number): string {
    if (!seats || seats <= 0) return 'autresVehicules';
    if (seats >= 70) return 'autobus';
    if (seats >= 40) return 'minibus';
    if (seats >= 35) return 'autocar';
    if (seats >= 24) return 'minicar';
    return 'autresVehicules';
  }

  private emptyBreakdown() {
    return {
      autocar: 0, minicar: 0, autobus: 0, minibus: 0,
      autresVehicules: 0, camionAmenage: 0, total: 0,
      placesOffertes: 0, nombreOperateurs: 0, pourcentage: 0,
      nombreChauffeurs: 0, voyageursJour: 0, voyageursMois: 0,
      nombreOperateursReel: 0,
    };
  }

  private addBreakdowns(a: any, b: any) {
    const result = this.emptyBreakdown();
    for (const key of Object.keys(result)) {
      result[key] = (a[key] || 0) + (b[key] || 0);
    }
    return result;
  }

  private emptySection() {
    return {
      transportPublicVoyageurs: {
        interWilaya: this.emptyBreakdown(),
        interCommunale: this.emptyBreakdown(),
        rural: this.emptyBreakdown(),
        urbain: this.emptyBreakdown(),
        sousTotal: this.emptyBreakdown(),
      },
      transport: {
        universitaire: this.emptyBreakdown(),
        scolaire: this.emptyBreakdown(),
        personnel: this.emptyBreakdown(),
        sousTotal: this.emptyBreakdown(),
      },
      total: this.emptyBreakdown(),
    };
  }

  private recalcSectionTotals(section: any) {
    const tpv = section.transportPublicVoyageurs;
    tpv.sousTotal = this.addBreakdowns(
      this.addBreakdowns(tpv.interWilaya, tpv.interCommunale),
      this.addBreakdowns(tpv.rural, tpv.urbain),
    );
    const tr = section.transport;
    tr.sousTotal = this.addBreakdowns(
      this.addBreakdowns(tr.universitaire, tr.scolaire),
      tr.personnel,
    );
    section.total = this.addBreakdowns(tpv.sousTotal, tr.sousTotal);
  }

  // =====================================================================
  // Age Distribution Helpers
  // =====================================================================

  private emptyAgeBreakdown() {
    return {
      moins5: 0, de5a10: 0, de10a15: 0, de15a20: 0,
      de20a25: 0, de25a30: 0, plus30: 0, total: 0,
      ageMoyen: 0, pourcentage: 0, parcVehiculesReel: 0,
      placesOffertes: 0,
    };
  }

  private addAgeBreakdowns(a: any, b: any) {
    const result = this.emptyAgeBreakdown();
    for (const key of Object.keys(result)) {
      if (key === 'ageMoyen') continue;
      result[key] = (a[key] || 0) + (b[key] || 0);
    }
    return result;
  }

  private emptyAgeSection() {
    return {
      transportPublicVoyageurs: {
        interWilaya: this.emptyAgeBreakdown(),
        interCommunale: this.emptyAgeBreakdown(),
        rural: this.emptyAgeBreakdown(),
        urbain: this.emptyAgeBreakdown(),
        sousTotal: this.emptyAgeBreakdown(),
      },
      transport: {
        universitaire: this.emptyAgeBreakdown(),
        scolaire: this.emptyAgeBreakdown(),
        personnel: this.emptyAgeBreakdown(),
        sousTotal: this.emptyAgeBreakdown(),
      },
      total: this.emptyAgeBreakdown(),
    };
  }

  private classifyVehicleAge(age: number): string {
    if (age < 5) return 'moins5';
    if (age < 10) return 'de5a10';
    if (age < 15) return 'de10a15';
    if (age < 20) return 'de15a20';
    if (age < 25) return 'de20a25';
    if (age < 30) return 'de25a30';
    return 'plus30';
  }

  private recalcAgeSectionTotals(section: any, ageSumTracker: Record<string, number>, sKey: string) {
    const tpv = section.transportPublicVoyageurs;
    tpv.sousTotal = this.addAgeBreakdowns(
      this.addAgeBreakdowns(tpv.interWilaya, tpv.interCommunale),
      this.addAgeBreakdowns(tpv.rural, tpv.urbain),
    );
    const tpvAgeSum = ['interWilaya', 'interCommunale', 'rural', 'urbain']
      .reduce((s, r) => s + (ageSumTracker[`${sKey}_transportPublicVoyageurs_${r}`] || 0), 0);
    tpv.sousTotal.ageMoyen = tpv.sousTotal.total > 0
      ? Math.round((tpvAgeSum / tpv.sousTotal.total) * 100) / 100 : 0;

    const tr = section.transport;
    tr.sousTotal = this.addAgeBreakdowns(
      this.addAgeBreakdowns(tr.universitaire, tr.scolaire),
      tr.personnel,
    );
    const trAgeSum = ['universitaire', 'scolaire', 'personnel']
      .reduce((s, r) => s + (ageSumTracker[`${sKey}_transport_${r}`] || 0), 0);
    tr.sousTotal.ageMoyen = tr.sousTotal.total > 0
      ? Math.round((trAgeSum / tr.sousTotal.total) * 100) / 100 : 0;

    section.total = this.addAgeBreakdowns(tpv.sousTotal, tr.sousTotal);
    const totalAgeSum = tpvAgeSum + trAgeSum;
    section.total.ageMoyen = section.total.total > 0
      ? Math.round((totalAgeSum / section.total.total) * 100) / 100 : 0;
  }

  // =====================================================================
  // Moyens Distribution Helpers
  // =====================================================================

  private emptyMoyensAgeBreakdown() {
    return {
      moins5: 0, de5a10: 0, de10a15: 0, de15a20: 0,
      de20a25: 0, de25a30: 0, plus30: 0, total: 0,
      ageMoyen: 0, pourcentage: 0,
    };
  }

  private addMoyensAgeBreakdowns(a: any, b: any) {
    const result = this.emptyMoyensAgeBreakdown();
    for (const key of Object.keys(result)) {
      if (key === 'ageMoyen') continue;
      result[key] = (a[key] || 0) + (b[key] || 0);
    }
    return result;
  }

  private emptyMoyensSection() {
    return {
      autocar: this.emptyMoyensAgeBreakdown(),
      minicar: this.emptyMoyensAgeBreakdown(),
      autobus: this.emptyMoyensAgeBreakdown(),
      minibus: this.emptyMoyensAgeBreakdown(),
      autresVehicules: this.emptyMoyensAgeBreakdown(),
      camionAmenage: this.emptyMoyensAgeBreakdown(),
      sousTotal: this.emptyMoyensAgeBreakdown(),
    };
  }

  private recalcMoyensSectionTotals(section: any, ageSumTracker: Record<string, number>, sKey: string) {
    const categories = ['autocar', 'minicar', 'autobus', 'minibus', 'autresVehicules', 'camionAmenage'];
    section.sousTotal = this.emptyMoyensAgeBreakdown();
    let totalAgeSum = 0;

    for (const cat of categories) {
      section.sousTotal = this.addMoyensAgeBreakdowns(section.sousTotal, section[cat]);
      const ageKey = `${sKey}_moyens_${cat}`;
      totalAgeSum += ageSumTracker[ageKey] || 0;
      section[cat].ageMoyen = section[cat].total > 0
        ? Math.round(((ageSumTracker[ageKey] || 0) / section[cat].total) * 100) / 100
        : 0;
    }

    section.sousTotal.ageMoyen = section.sousTotal.total > 0
      ? Math.round((totalAgeSum / section.sousTotal.total) * 100) / 100 : 0;
  }

  private mapFontTypeToRow(fontType: string): { group: string; row: string } | null {
    const mapping: Record<string, { group: string; row: string }> = {
      'بين الولايات': { group: 'transportPublicVoyageurs', row: 'interWilaya' },
      'بين البلديات': { group: 'transportPublicVoyageurs', row: 'interCommunale' },
      'ريـفي': { group: 'transportPublicVoyageurs', row: 'rural' },
      'ريفي': { group: 'transportPublicVoyageurs', row: 'rural' },
      'حضري أو شبه حضري': { group: 'transportPublicVoyageurs', row: 'urbain' },
      'نقل جامعي': { group: 'transport', row: 'universitaire' },
      'نقل مدرسي': { group: 'transport', row: 'scolaire' },
      'نقل العمال': { group: 'transport', row: 'personnel' },
    };
    return mapping[fontType] || null;
  }

  /**
   * Calcul du Canevas n°01 depuis la base de données
   */
  async getCanevasTransport(startDate?: Date, endDate?: Date, wilaya?: string, annee?: string, trimestre?: string) {
    try {
      // Filtre: exclure les véhicules arrêtés définitivement
      const dateFilter: any = {
        $nor: [{ vihicile_parked: 'نعم', type_parked: 'نهائي' }],
      };
      if (startDate && endDate) {
        dateFilter.createdAt = { $gte: startDate, $lt: endDate };
      }

      // 1. Récupérer les véhicules
      const vehicles = await this.vehiculeModel.find(dateFilter).lean();

      // 2. Récupérer les opérateurs valides
      const allClientIds = [...new Set(vehicles.map(v => v.num_docier_client).filter(Boolean))];
      const operateurs = await this.operateurModel
        .find({ num_docier_client: { $in: allClientIds } })
        .select('num_docier_client').lean();
      const operateurSet = new Set(operateurs.map(o => o.num_docier_client));

      // 3. Compter les chauffeurs par opérateur
      const chauffeurAgg = await this.chauffeurModel.aggregate([
        { $group: { _id: '$num_enregistrement_du_transporteur', count: { $sum: 1 } } },
      ]);
      const chauffeurMap = new Map<number, number>();
      for (const ch of chauffeurAgg) chauffeurMap.set(ch._id, ch.count);

      // 4. Initialiser les deux sections
      const statutPublic = this.emptySection();
      const statutPrive = this.emptySection();

      // Tracker opérateurs uniques par ligne
      const opTracker: Record<string, Set<number>> = {};

      // Age distribution tracking
      const ageStatutPublic = this.emptyAgeSection();
      const ageStatutPrive = this.emptyAgeSection();
      const ageSumTracker: Record<string, number> = {};

      // Moyens tracking
      const moyensStatutPublic = this.emptyMoyensSection();
      const moyensStatutPrive = this.emptyMoyensSection();

      // 5. Traiter chaque véhicule
      for (const v of vehicles) {
        const mapping = this.mapFontTypeToRow(v.font_type);
        if (!mapping) continue;

        const { group, row } = mapping;
        const section = v.status_activite === 'PUBLIC' ? statutPublic : statutPrive;
        const sKey = v.status_activite === 'PUBLIC' ? 'pub' : 'prv';
        const rowData = section[group]?.[row];
        if (!rowData) continue;

        const seats = Number(v.Number_of_seats) || 0;
        const cat = this.classifyVehicleCategory(seats);

        rowData[cat] += 1;
        rowData.total += 1;
        rowData.placesOffertes += seats;

        // Tracker opérateur unique
        const tKey = `${sKey}_${group}_${row}`;
        if (!opTracker[tKey]) opTracker[tKey] = new Set();
        if (v.num_docier_client && operateurSet.has(v.num_docier_client)) {
          opTracker[tKey].add(v.num_docier_client);
        }

        // Age distribution tracking
        const currentYear = new Date().getFullYear();
        const firstYear = parseInt(String(v.First_year_of_use)) || currentYear;
        const vehicleAge = Math.max(0, currentYear - firstYear);
        const ageBracket = this.classifyVehicleAge(vehicleAge);

        const ageSection = v.status_activite === 'PUBLIC' ? ageStatutPublic : ageStatutPrive;
        const ageRowData = ageSection[group]?.[row];
        if (ageRowData) {
          ageRowData[ageBracket] += 1;
          ageRowData.total += 1;
          ageRowData.placesOffertes += seats;
          ageRowData.parcVehiculesReel += 1;
          const ageKey = `${sKey}_${group}_${row}`;
          if (!ageSumTracker[ageKey]) ageSumTracker[ageKey] = 0;
          ageSumTracker[ageKey] += vehicleAge;
        }

        // Moyens tracking
        const moyensSection = v.status_activite === 'PUBLIC' ? moyensStatutPublic : moyensStatutPrive;
        const moyensRowData = moyensSection[cat];
        if (moyensRowData) {
          moyensRowData[ageBracket] += 1;
          moyensRowData.total += 1;
          const mAgeKey = `${sKey}_moyens_${cat}`;
          if (!ageSumTracker[mAgeKey]) ageSumTracker[mAgeKey] = 0;
          ageSumTracker[mAgeKey] += vehicleAge;
        }
      }

      // 6. Injecter nombre d'opérateurs et chauffeurs
      const injectCounts = (section: any, sKey: string) => {
        for (const gKey of ['transportPublicVoyageurs', 'transport']) {
          for (const rKey of Object.keys(section[gKey])) {
            if (rKey === 'sousTotal') continue;
            const tKey = `${sKey}_${gKey}_${rKey}`;
            const ops = opTracker[tKey] || new Set();
            section[gKey][rKey].nombreOperateurs = ops.size;
            section[gKey][rKey].nombreOperateursReel = ops.size;
            let chCount = 0;
            for (const opId of ops) chCount += chauffeurMap.get(opId) || 0;
            section[gKey][rKey].nombreChauffeurs = chCount;
          }
        }
      };
      injectCounts(statutPublic, 'pub');
      injectCounts(statutPrive, 'prv');

      // 7. Calculer sous-totaux
      this.recalcSectionTotals(statutPublic);
      this.recalcSectionTotals(statutPrive);

      // 8. Section combinée (Public + Privé)
      const combined = this.emptySection();
      for (const gKey of ['transportPublicVoyageurs', 'transport']) {
        for (const rKey of Object.keys(combined[gKey])) {
          combined[gKey][rKey] = this.addBreakdowns(statutPublic[gKey][rKey], statutPrive[gKey][rKey]);
        }
      }
      combined.total = this.addBreakdowns(statutPublic.total, statutPrive.total);

      // 9. Pourcentages
      const calcPct = (sec: any) => {
        const t = sec.total.nombreOperateurs || 1;
        for (const gKey of ['transportPublicVoyageurs', 'transport']) {
          for (const rKey of Object.keys(sec[gKey])) {
            sec[gKey][rKey].pourcentage = Math.round((sec[gKey][rKey].nombreOperateurs / t) * 10000) / 100;
          }
        }
        sec.total.pourcentage = 100;
      };
      calcPct(statutPublic);
      calcPct(statutPrive);
      calcPct(combined);

      // =====================================================================
      // 10. Age Distribution Calculations
      // =====================================================================

      // Calculate ageMoyen for individual rows
      const calcRowAgeMoyens = (section: any, sKey: string) => {
        for (const gKey of ['transportPublicVoyageurs', 'transport']) {
          for (const rKey of Object.keys(section[gKey])) {
            if (rKey === 'sousTotal') continue;
            const ageKey = `${sKey}_${gKey}_${rKey}`;
            const rowData = section[gKey][rKey];
            rowData.ageMoyen = rowData.total > 0
              ? Math.round(((ageSumTracker[ageKey] || 0) / rowData.total) * 100) / 100
              : 0;
          }
        }
      };
      calcRowAgeMoyens(ageStatutPublic, 'pub');
      calcRowAgeMoyens(ageStatutPrive, 'prv');

      // Recalculate age section totals (subtotals + section total + ageMoyen)
      this.recalcAgeSectionTotals(ageStatutPublic, ageSumTracker, 'pub');
      this.recalcAgeSectionTotals(ageStatutPrive, ageSumTracker, 'prv');

      // Combined age section
      const ageCombined = this.emptyAgeSection();
      for (const gKey of ['transportPublicVoyageurs', 'transport']) {
        for (const rKey of Object.keys(ageCombined[gKey])) {
          ageCombined[gKey][rKey] = this.addAgeBreakdowns(
            ageStatutPublic[gKey][rKey], ageStatutPrive[gKey][rKey],
          );
        }
      }
      ageCombined.total = this.addAgeBreakdowns(ageStatutPublic.total, ageStatutPrive.total);

      // Calculate ageMoyen for combined rows
      for (const gKey of ['transportPublicVoyageurs', 'transport']) {
        for (const rKey of Object.keys(ageCombined[gKey])) {
          if (rKey === 'sousTotal') continue;
          const totalAgeSum = (ageSumTracker[`pub_${gKey}_${rKey}`] || 0) + (ageSumTracker[`prv_${gKey}_${rKey}`] || 0);
          const rowData = ageCombined[gKey][rKey];
          rowData.ageMoyen = rowData.total > 0 ? Math.round((totalAgeSum / rowData.total) * 100) / 100 : 0;
        }
      }
      // Combined sous-totals ageMoyen
      const tpvKeys = ['interWilaya', 'interCommunale', 'rural', 'urbain'];
      const tpvCombAgeSum = tpvKeys.reduce((s, r) =>
        s + (ageSumTracker[`pub_transportPublicVoyageurs_${r}`] || 0) + (ageSumTracker[`prv_transportPublicVoyageurs_${r}`] || 0), 0);
      ageCombined.transportPublicVoyageurs.sousTotal.ageMoyen = ageCombined.transportPublicVoyageurs.sousTotal.total > 0
        ? Math.round((tpvCombAgeSum / ageCombined.transportPublicVoyageurs.sousTotal.total) * 100) / 100 : 0;

      const trKeys = ['universitaire', 'scolaire', 'personnel'];
      const trCombAgeSum = trKeys.reduce((s, r) =>
        s + (ageSumTracker[`pub_transport_${r}`] || 0) + (ageSumTracker[`prv_transport_${r}`] || 0), 0);
      ageCombined.transport.sousTotal.ageMoyen = ageCombined.transport.sousTotal.total > 0
        ? Math.round((trCombAgeSum / ageCombined.transport.sousTotal.total) * 100) / 100 : 0;

      ageCombined.total.ageMoyen = ageCombined.total.total > 0
        ? Math.round(((tpvCombAgeSum + trCombAgeSum) / ageCombined.total.total) * 100) / 100 : 0;

      // Age percentages
      const calcAgePct = (sec: any) => {
        const t = sec.total.total || 1;
        for (const gKey of ['transportPublicVoyageurs', 'transport']) {
          for (const rKey of Object.keys(sec[gKey])) {
            sec[gKey][rKey].pourcentage = Math.round((sec[gKey][rKey].total / t) * 10000) / 100;
          }
        }
        sec.total.pourcentage = 100;
      };
      calcAgePct(ageStatutPublic);
      calcAgePct(ageStatutPrive);
      calcAgePct(ageCombined);

      // =====================================================================
      // 11. Moyens (LES MOYENS) Calculations
      // =====================================================================

      this.recalcMoyensSectionTotals(moyensStatutPublic, ageSumTracker, 'pub');
      this.recalcMoyensSectionTotals(moyensStatutPrive, ageSumTracker, 'prv');

      // Combined moyens section
      const moyensCombined = this.emptyMoyensSection();
      const categories = ['autocar', 'minicar', 'autobus', 'minibus', 'autresVehicules', 'camionAmenage'];
      for (const cat of categories) {
        moyensCombined[cat] = this.addMoyensAgeBreakdowns(moyensStatutPublic[cat], moyensStatutPrive[cat]);
        const totalAgeSum = (ageSumTracker[`pub_moyens_${cat}`] || 0) + (ageSumTracker[`prv_moyens_${cat}`] || 0);
        moyensCombined[cat].ageMoyen = moyensCombined[cat].total > 0
          ? Math.round((totalAgeSum / moyensCombined[cat].total) * 100) / 100 : 0;
      }
      moyensCombined.sousTotal = this.addMoyensAgeBreakdowns(moyensStatutPublic.sousTotal, moyensStatutPrive.sousTotal);
      const combMoyensAgeSum = categories.reduce((s, c) =>
        s + (ageSumTracker[`pub_moyens_${c}`] || 0) + (ageSumTracker[`prv_moyens_${c}`] || 0), 0);
      moyensCombined.sousTotal.ageMoyen = moyensCombined.sousTotal.total > 0
        ? Math.round((combMoyensAgeSum / moyensCombined.sousTotal.total) * 100) / 100 : 0;

      // Moyens percentages
      const calcMoyensPct = (sec: any) => {
        const t = sec.sousTotal.total || 1;
        for (const cat of categories) {
          sec[cat].pourcentage = Math.round((sec[cat].total / t) * 10000) / 100;
        }
        sec.sousTotal.pourcentage = 100;
      };
      calcMoyensPct(moyensStatutPublic);
      calcMoyensPct(moyensStatutPrive);
      calcMoyensPct(moyensCombined);

      return {
        wilaya: wilaya || '',
        annee: annee || new Date().getFullYear().toString(),
        trimestre: trimestre || '1',
        statutPublic, statutPrive, combined,
        ageStatutPublic, ageStatutPrive, ageCombined,
        moyensStatutPublic, moyensStatutPrive, moyensCombined,
      };
    } catch (error) {
      console.error('❌ getCanevasTransport error:', error);
      throw new InternalServerErrorException({ message: 'Erreur calcul Canevas', error: error.message });
    }
  }

  /**
   * Export Excel du Canevas n°01
   */
  async exportCanevasExcel(startDate?: Date, endDate?: Date, wilaya?: string, annee?: string, trimestre?: string) {
    const ExcelJS = require('exceljs');
    const data = await this.getCanevasTransport(startDate, endDate, wilaya, annee, trimestre);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Canevas n°01');

    const cols = ['STATUT', 'Autocar', 'Minicar', 'Autobus', 'Minibus', 'Autres Véh.', 'Camion Am.', 'TOTAL', 'Places off.', 'Nb opér.', '%', 'Nb Chauff.', 'Voy/Jour', 'Voy/Mois', 'Nb opér.(réel)'];

    const applyBorders = (row: any, maxCol: number) => {
      for (let i = 1; i <= maxCol; i++) {
        const cell = row.getCell(i);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    };

    // Apply fill/font/alignment ONLY to cells within maxCol, clear cells beyond
    const applyRowStyle = (row: any, maxCol: number, style: { font?: any; fill?: any; alignment?: any }) => {
      for (let i = 1; i <= maxCol; i++) {
        const cell = row.getCell(i);
        if (style.font) cell.font = style.font;
        if (style.fill) cell.fill = style.fill;
        if (style.alignment) cell.alignment = style.alignment;
      }
      // Clear cells beyond the table width
      for (let i = maxCol + 1; i <= 15; i++) {
        const cell = row.getCell(i);
        cell.fill = undefined;
        cell.font = {};
        cell.value = null;
      }
    };

    // Titre
    sheet.mergeCells('A1:O1');
    const tc = sheet.getCell('A1');
    tc.value = 'Canevas n°01: TRANSPORT ROUTIER DE VOYAGEURS';
    tc.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    tc.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorders(sheet.getRow(1), 15);

    sheet.mergeCells('A2:O2');
    const t2 = sheet.getCell('A2');
    t2.value = `Wilaya: ${data.wilaya || '___'} | Année: ${data.annee} | Trimestre: ${data.trimestre}`;
    t2.font = { bold: true, size: 11, color: { argb: 'FF1E3A8A' } };
    t2.alignment = { horizontal: 'center' };
    applyBorders(sheet.getRow(2), 15);

    const hr = sheet.addRow(cols);
    hr.height = 25;
    applyRowStyle(hr, 15, {
      font: { bold: true, size: 9, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    });
    applyBorders(hr, 15);

    sheet.getColumn(1).width = 28; // Labels
    for (let i = 2; i <= 15; i++) {
      sheet.getColumn(i).width = 9; // Compact columns
    }
    // Specific wider columns for dates or longer numbers if needed
    sheet.getColumn(9).width = 11; // Places off.
    sheet.getColumn(14).width = 11; // Voy/Mois
    sheet.getColumn(15).width = 11; // Nb opér.(réel)

    const addRow = (label: string, bd: any, opts: any = {}) => {
      const r = sheet.addRow([label, bd.autocar, bd.minicar, bd.autobus, bd.minibus, bd.autresVehicules, bd.camionAmenage, bd.total, bd.placesOffertes, bd.nombreOperateurs, bd.pourcentage, bd.nombreChauffeurs, bd.voyageursJour, bd.voyageursMois, bd.nombreOperateursReel]);
      if (opts.isTotal) {
        applyRowStyle(r, 15, {
          font: { bold: true, color: { argb: 'FFFFFFFF' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
        });
      } else if (opts.isSubtotal) {
        applyRowStyle(r, 15, {
          font: { bold: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F7FF' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
        });
      } else {
        applyRowStyle(r, 15, {
          alignment: { horizontal: 'center', vertical: 'middle' },
        });
      }
      applyBorders(r, 15);
    };

    const renderSec = (sec: any, label: string) => {
      const sh = sheet.addRow([label]);
      sheet.mergeCells(`A${sh.number}:O${sh.number}`);
      applyRowStyle(sh, 15, {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } },
      });
      applyBorders(sh, 15);
      addRow('  Inter-wilaya', sec.transportPublicVoyageurs.interWilaya);
      addRow('  Inter-communale', sec.transportPublicVoyageurs.interCommunale);
      addRow('  RURAL', sec.transportPublicVoyageurs.rural);
      addRow('  URBAIN', sec.transportPublicVoyageurs.urbain);
      addRow('  S/TOTAL', sec.transportPublicVoyageurs.sousTotal, { isSubtotal: true });
      addRow('  universitaire', sec.transport.universitaire);
      addRow('  scolaire', sec.transport.scolaire);
      addRow('  personnel', sec.transport.personnel);
      addRow('  S/TOTAL', sec.transport.sousTotal, { isSubtotal: true });
    };

    renderSec(data.statutPublic, '1. STATUT PUBLIC');
    addRow('TOTAL 01 (STATUT PUBLIC)', data.statutPublic.total, { isTotal: true });
    renderSec(data.statutPrive, '2. STATUT PRIVÉ');
    addRow('TOTAL 02 (STATUT PRIVÉ)', data.statutPrive.total, { isTotal: true });
    renderSec(data.combined, '3. COMBINÉ (PUBLIC + PRIVÉ)');
    addRow('TOTAL GÉNÉRAL (1+2)', data.combined.total, { isTotal: true });

    // =====================================================================
    // Age Distribution Table
    // =====================================================================
    sheet.addRow([]);
    sheet.addRow([]);

    const ageTitle = sheet.addRow(['Répartition du « Parc véhicules de transport de voyageurs » par tranches d\'âges :']);
    sheet.mergeCells(`A${ageTitle.number}:M${ageTitle.number}`);
    applyRowStyle(ageTitle, 13, {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
    });
    applyBorders(ageTitle, 13);

    const ageCols = ['Tranches d\'âges (ans)', 'Moins de 05 ans', '[5,10[', '[10,15[', '[15,20[', '[20,25[', '[25,30[', '30 ans et plus', 'TOTAL', 'Âge moyen (ans)', '%', 'Parc Véh. (réel)', 'Places off.'];
    const ahr = sheet.addRow(ageCols);
    ahr.height = 22;
    applyRowStyle(ahr, 13, {
      font: { bold: true, size: 9, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    });
    applyBorders(ahr, 13);

    // Adjusting column widths for Age Table (overlaps with first table columns)
    // No need to set getColumn again as they are shared, but we can tweak if needed.
    // However, Age Table has 13 cols, shared with first 13 of main table.


    const addAgeRow = (label: string, bd: any, opts: any = {}) => {
      const r = sheet.addRow([label, bd.moins5, bd.de5a10, bd.de10a15, bd.de15a20, bd.de20a25, bd.de25a30, bd.plus30, bd.total, bd.ageMoyen, bd.pourcentage, bd.parcVehiculesReel, bd.placesOffertes]);
      if (opts.isTotal) {
        applyRowStyle(r, 13, {
          font: { bold: true, color: { argb: 'FFFFFFFF' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
        });
      } else if (opts.isSubtotal) {
        applyRowStyle(r, 13, {
          font: { bold: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F7FF' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
        });
      } else {
        applyRowStyle(r, 13, {
          alignment: { horizontal: 'center', vertical: 'middle' },
        });
      }
      applyBorders(r, 13);
    };

    const renderAgeSec = (sec: any, label: string) => {
      const sh = sheet.addRow([label]);
      sheet.mergeCells(`A${sh.number}:M${sh.number}`);
      applyRowStyle(sh, 13, {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } },
      });
      applyBorders(sh, 13);
      addAgeRow('  Inter-wilaya', sec.transportPublicVoyageurs.interWilaya);
      addAgeRow('  Inter-communale', sec.transportPublicVoyageurs.interCommunale);
      addAgeRow('  RURAL', sec.transportPublicVoyageurs.rural);
      addAgeRow('  URBAIN', sec.transportPublicVoyageurs.urbain);
      addAgeRow('  S/TOTAL', sec.transportPublicVoyageurs.sousTotal, { isSubtotal: true });
      addAgeRow('  universitaire', sec.transport.universitaire);
      addAgeRow('  scolaire', sec.transport.scolaire);
      addAgeRow('  personnel', sec.transport.personnel);
      addAgeRow('  S/TOTAL', sec.transport.sousTotal, { isSubtotal: true });
    };

    renderAgeSec(data.ageStatutPublic, '1. STATUT PUBLIC');
    addAgeRow('TOTAL 01 (STATUT PUBLIC)', data.ageStatutPublic.total, { isTotal: true });
    renderAgeSec(data.ageStatutPrive, '2. STATUT PRIVÉ');
    addAgeRow('TOTAL 02 (STATUT PRIVÉ)', data.ageStatutPrive.total, { isTotal: true });
    renderAgeSec(data.ageCombined, '3. COMBINÉ (PUBLIC + PRIVÉ)');
    addAgeRow('TOTAL GÉNÉRAL (1+2)', data.ageCombined.total, { isTotal: true });

    // =====================================================================
    // Moyens (LES MOYENS) Table
    // =====================================================================
    sheet.addRow([]);
    sheet.addRow([]);

    const moyensTitle = sheet.addRow(['LES MOYENS']);
    sheet.mergeCells(`A${moyensTitle.number}:K${moyensTitle.number}`);
    applyRowStyle(moyensTitle, 11, {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
    });
    applyBorders(moyensTitle, 11);

    const moyensCols = ['Tranches d\'âges (ans)', 'Moins de 05 ans', '[5,10[', '[10,15[', '[15,20[', '[20,25[', '[25,30[', '30 ans et plus', 'TOTAL', 'Âge moyen (ans)', '%'];
    const mhr = sheet.addRow(moyensCols);
    mhr.height = 22;
    applyRowStyle(mhr, 11, {
      font: { bold: true, size: 9, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    });
    applyBorders(mhr, 11);

    const addMoyensRow = (label: string, bd: any, opts: any = {}) => {
      const r = sheet.addRow([label, bd.moins5, bd.de5a10, bd.de10a15, bd.de15a20, bd.de20a25, bd.de25a30, bd.plus30, bd.total, bd.ageMoyen, bd.pourcentage]);
      if (opts.isTotal) {
        applyRowStyle(r, 11, {
          font: { bold: true, color: { argb: 'FFFFFFFF' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
        });
      } else if (opts.isSubtotal) {
        applyRowStyle(r, 11, {
          font: { bold: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F7FF' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
        });
      } else {
        applyRowStyle(r, 11, {
          alignment: { horizontal: 'center', vertical: 'middle' },
        });
      }
      applyBorders(r, 11);
    };

    const renderMoyensSec = (sec: any, label: string) => {
      const sh = sheet.addRow([label]);
      sheet.mergeCells(`A${sh.number}:K${sh.number}`);
      applyRowStyle(sh, 11, {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } },
      });
      applyBorders(sh, 11);
      addMoyensRow('  Autocar (35+)', sec.autocar);
      addMoyensRow('  Minicar (24-34)', sec.minicar);
      addMoyensRow('  Autobus (70+)', sec.autobus);
      addMoyensRow('  Minibus (40-69)', sec.minibus);
      addMoyensRow('  Autres Véh. (10-23)', sec.autresVehicules);
      addMoyensRow('  Camion Aménagé', sec.camionAmenage);
      addMoyensRow('  S/TOTAL', sec.sousTotal, { isSubtotal: true });
    };

    renderMoyensSec(data.moyensStatutPublic, '1. STATUT PUBLIC');
    renderMoyensSec(data.moyensStatutPrive, '2. STATUT PRIVÉ');
    renderMoyensSec(data.moyensCombined, '3. COMBINÉ (PUBLIC + PRIVÉ)');
    addMoyensRow('TOTAL(1+2)(PUBLIC)+(PRIVÉ)', data.moyensCombined.sousTotal, { isTotal: true });

    return workbook;
  }

  async getVehicleStats() {
    const result = await this.vehiculeModel.aggregate([
      {
        $group: {
          _id: null,

          // ✅ Total vehicles
          totalVehicles: { $sum: 1 },

          // ✅ Parked vehicles
          stoppedVehicles: {
            $sum: {
              $cond: [{ $eq: ['$vihicile_parked', 'نعم'] }, 1, 0],
            },
          },

          // ✅ Sum of num_up
          changedLineVehicles: {
            $sum: { $ifNull: ['$num_up', 0] },
          },
        },
      },
    ]);

    return (
      result[0] || {
        totalVehicles: 0,
        stoppedVehicles: 0,
        changedLineVehicles: 0,
      }
    );
  }


}
