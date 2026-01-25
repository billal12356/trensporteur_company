import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VihiclesDocument = HydratedDocument<Vihicles>;

@Schema({ timestamps: true })
export class Vihicles {
  @Prop() num_wilaya?: number;
  @Prop() num_docier_client?: number;

  @Prop() fullName_arabe?: string;
  @Prop() fullName_francais?: string;

  @Prop() activite?: string;
  @Prop() colonne1?: string;

  @Prop() nature_activite?: string;
  @Prop() colonne2?: string;

  @Prop() status_activite?: string;
  @Prop() colonne3?: string;

  @Prop() num_bus_registration?: string;
  @Prop() circle?: string;
  @Prop() Municipality?: string;
  @Prop() Style?: string;
  @Prop() category?: string;
  @Prop() type?: string;

  @Prop() First_year_of_use?: number;

  @Prop() total_load_trucks?: number;
  @Prop() restricted_load?: number;
  @Prop() Number_of_seats?: number;

  @Prop() Energy?: string;

  @Prop() num_driving_license?: number;
  @Prop() driving_license_history?: Date;
  @Prop() driving_license_dure?: string;

  @Prop() line_activity_start_date?: Date;
  @Prop() Vehicle_activity_start_date?: Date;

  @Prop() font_type?: string;
  @Prop() colonne4?: string;
  @Prop() font_symbol?: string;

  @Prop() point_depart?: string;
  @Prop() point_arrive?: string;

  @Prop() point_Traffic1?: string;
  @Prop() point_Traffic2?: string;
  @Prop() point_Traffic3?: string;
  @Prop() point_Traffic4?: string;
  @Prop() point_Traffic5?: string;

  @Prop() line_start_time?: string;
  @Prop() line_end_time?: string;
  @Prop() Pace_per_minute?: string;

  @Prop() time_depart1?: string;
  @Prop() time_depart2?: string;
  @Prop() time_depart3?: string;
  @Prop() time_depart4?: string;

  @Prop({ enum: ['نعم', 'لا'] })
  vihicile_parked?: string;

  @Prop({ enum: ['مؤقت', 'نهائي'] })
  type_parked?: string;

  @Prop() hestoire_parked?: Date;
  @Prop() hestoire_parked_end?: Date;

  @Prop() comments?: string;
  @Prop() person_concerned?: string;
  @Prop() note_chef_departement?: string;

  @Prop() path?: string;
  @Prop() num_up?: number;
}

export const VihiclesSchema = SchemaFactory.createForClass(Vihicles);
