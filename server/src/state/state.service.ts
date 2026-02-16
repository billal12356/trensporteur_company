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
      const tpvVichecle = vehicles.filter((v) =>
        ['بين البلديات', 'بين الولايات', 'حضري أو شبه حضري', 'ريفي', 'ريـفي'].includes(v.font_type),
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
        ['بين البلديات', 'بين الولايات', 'حضري أو شبه حضري', 'ريفي', 'ريـفي'].includes(v.font_type),
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


}
