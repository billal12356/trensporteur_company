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
  async getCanevasTransport(startDate?: Date, endDate?: Date) {
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

      return { wilaya: '', annee: new Date().getFullYear().toString(), trimestre: '1', statutPublic, statutPrive, combined };
    } catch (error) {
      console.error('❌ getCanevasTransport error:', error);
      throw new InternalServerErrorException({ message: 'Erreur calcul Canevas', error: error.message });
    }
  }

  /**
   * Export Excel du Canevas n°01
   */
  async exportCanevasExcel(startDate?: Date, endDate?: Date) {
    const ExcelJS = require('exceljs');
    const data = await this.getCanevasTransport(startDate, endDate);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Canevas n°01');

    const cols = ['STATUT', 'Autocar', 'Minicar', 'Autobus', 'Minibus', 'Autres Véh.', 'Camion Am.', 'TOTAL', 'Places off.', 'Nb opér.', '%', 'Nb Chauff.', 'Voy/Jour', 'Voy/Mois', 'Nb opér.(réel)'];

    // Titre
    sheet.mergeCells('A1:O1');
    const tc = sheet.getCell('A1');
    tc.value = 'Canevas n°01: TRANSPORT ROUTIER DE VOYAGEURS';
    tc.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    tc.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells('A2:O2');
    sheet.getCell('A2').value = `Wilaya: ${data.wilaya || '___'} | Année: ${data.annee} | Trimestre: ${data.trimestre}`;
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    const hr = sheet.addRow(cols);
    hr.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
    hr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    hr.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    sheet.getColumn(1).width = 35;
    for (let i = 2; i <= 15; i++) sheet.getColumn(i).width = 12;

    const addRow = (label: string, bd: any, opts: any = {}) => {
      const r = sheet.addRow([label, bd.autocar, bd.minicar, bd.autobus, bd.minibus, bd.autresVehicules, bd.camionAmenage, bd.total, bd.placesOffertes, bd.nombreOperateurs, bd.pourcentage, bd.nombreChauffeurs, bd.voyageursJour, bd.voyageursMois, bd.nombreOperateursReel]);
      if (opts.isTotal) { r.font = { bold: true, color: { argb: 'FFFFFFFF' } }; r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }; }
      else if (opts.isSubtotal) { r.font = { bold: true }; r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }; }
      r.alignment = { horizontal: 'center', vertical: 'middle' };
      r.eachCell(c => { c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
    };

    const renderSec = (sec: any, label: string) => {
      const sh = sheet.addRow([label]); sheet.mergeCells(`A${sh.number}:O${sh.number}`);
      sh.font = { bold: true, color: { argb: 'FFFFFFFF' } }; sh.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
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
