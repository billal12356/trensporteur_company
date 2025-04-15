
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VihiclesDocument = HydratedDocument<Vihicles>;

@Schema()
export class Vihicles {
    @Prop({
        type: Number,
        required: true,
    })
    num_wilaya: number;

    @Prop({
        type: Number,
        required: true
    })
    num_docier_client: number;

    @Prop({ type: String, required: [true, "الاسم الكامل بالعربية مطلوب!"] })
    fullName_arabe: string;

    @Prop({ type: String, required: [true, "الاسم الكامل بالفرنسية مطلوب!"] })
    fullName_francais: string;

    @Prop({ type: String, required: [true, "النشاط مطلوب!"] })
    activite: string;

    @Prop({ type: String, })
    colonne1: string;

    @Prop({ type: String, required: [true, "طبيعة النشاط مطلوبة!"] })
    nature_activite: string;

    @Prop({ type: String })
    colonne2: string;

    @Prop({ type: String, required: [true, "حالة النشاط مطلوبة!"] })
    status_activite: string;

    @Prop({ type: String })
    colonne3: string;

    @Prop({
        type: Number,
        required: true
    })
    num_bus_registration: number


    @Prop({
        type: String,
        required: true
    })
    circle: string

    @Prop({
        type: String,
        required: true
    })
    Municipality: string

    @Prop({
        type: String,
        required: true
    })
    Style: string

    @Prop({
        type: String,
        required: true
    })
    category: string

    @Prop({
        type: String,
        required: true
    })
    type: string

    @Prop({
        type: String,
        required: true
    })
    First_year_of_use: string

    @Prop({
        type: Number,
        required: true
    })
    Number_of_seats: number

    @Prop({
        type: String,
        required: true
    })
    Energy: string

    @Prop({
        type: Number,
        required: true
    })
    num_driving_license: number

    @Prop({
        type: Date,
        required: true
    })
    driving_license_history: Date

    @Prop({
        type: String,
        required: true
    })
    driving_license_dure: string

    @Prop({
        type: Date,
        required: true
    })
    line_activity_start_date: Date

    @Prop({
        type: Date,
        required: true
    })
    Vehicle_activity_start_date: Date

    @Prop({
        type: String,
        required: true
    })
    font_type: string

    @Prop({
        type: String,
        required: true
    })
    colonne4: string

    @Prop({
        type: String,
        required: true
    })
    font_symbol: string

    @Prop({
        type: String,
        required: true
    })
    point_depart: string

    @Prop({
        type: String,
        required: true
    })
    point_arrive: string

    @Prop({
        type: String,
        required: true
    })
    point_Traffic1: string

    @Prop({
        type: String,
        required: true
    })
    point_Traffic2: string

    @Prop({
        type: String,
        required: true
    })
    point_Traffic3: string

    @Prop({
        type: String,
        required: true
    })
    point_Traffic4: string

    @Prop({
        type: String,
        required: true
    })
    point_Traffic5: string

    @Prop({
        type: String,
        required: true
    })
    line_start_time: string

    @Prop({
        type: String,
        required: true
    })
    line_end_time: string

    @Prop({
        type: String,
        required: true
    })
    Pace_per_minute: string

    @Prop({
        type: String,
        required: true
    })
    time_depart1: string

    @Prop({
        type: String,
        required: true
    })
    time_depart2: string

    @Prop({
        type: String,
        required: true
    })
    time_depart3: string

    @Prop({
        type: String,
        required: true
    })
    time_depart4: string

    @Prop({ type: String, enum: ['موقفة', 'لا'] })
    vihicile_parked: string;

    @Prop({ type: String, enum: ['مؤقت', 'نهائي'] })
    type_parked: string;

    @Prop({
        type: Date,
        required: true
    })
    hestoire_parked: Date

  
    @Prop({
        type: Date,
        required: true
    })
    hestoire_parked_end: Date

    @Prop({ type: String})
    comments: string;

    @Prop({ type: String})
    person_concerned: string;

    @Prop({ type: String })
    note_chef_departement: string;

    
    @Prop({ type: String })
    path: string;


}

export const VihiclesSchema = SchemaFactory.createForClass(Vihicles);
