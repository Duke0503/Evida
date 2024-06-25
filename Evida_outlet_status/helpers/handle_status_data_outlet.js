const outlets = require('../models/outlet.model');
const { save_data_to_database } = require('./save_data_to_database');

const handle_status_data_outlet = async (
  ebox_id,
  data_ebox,
  list_ebox_outlet,
) => {
  const list_outlet = data_ebox.toString().split(',');

  for (let count = 0; count < list_outlet.length - 1; count++) {
    const outlet_id = list_outlet[count].split('-')[0];
    const outlet_status = list_outlet[count].split('-')[1];

    if (Number(outlet_status) != 6) {
      const ebox_outlet_id = 'Ebox_' + ebox_id + '_' + outlet_id;
      const outlet = await outlets.findOne({
        name: ebox_outlet_id,
      });

      if (!list_ebox_outlet[ebox_outlet_id]) {
        list_ebox_outlet[ebox_outlet_id] = {
          outlet_id : Number(outlet_id),
          ebox_id : 'Ebox_' + ebox_id,
          ebox_status: Number(list_outlet[list_outlet.length - 1].split('-')[1]),  
          outlet_status: Number(outlet_status),
          current: 0,
          voltage: 0,
          power_factor: 0,
          power_consumption: 0,
        };
        if (!outlet) {
          await outlets.create({
            name: ebox_outlet_id,
            outlet_status: Number(outlet_status),
            update_time: new Date(),
          });

          list_ebox_outlet[ebox_outlet_id].outlet_status = Number(outlet_status);  
        } else {
          list_ebox_outlet[ebox_outlet_id].outlet_status = outlet.outlet_status;
        };
      };

      if (list_ebox_outlet[ebox_outlet_id].outlet_status != Number(outlet_status)) {

        await outlets.updateOne(
          {
            _id: outlet._id,   
          }, 
          { $set:  
            { 
              status: Number(outlet_status),
              update_time: new Date(),
            } 
          }
        );

        list_ebox_outlet[ebox_outlet_id].outlet_status = Number(outlet_status);

        save_data_to_database(list_ebox_outlet[ebox_outlet_id]);
      };
    };
  };
};

module.exports = { handle_status_data_outlet };