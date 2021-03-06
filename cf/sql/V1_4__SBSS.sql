create or replace function sys_xs_sbss.validate_binding_credential(
    in p_service_user_name                      text,
    in p_service_user_password                  text)
    returns                                     sys_xs_sbss.service
    security definer
as $$
    declare p_config sys_xs_sbss.config;
    declare p_returndata                        sys_xs_sbss.service;
    declare p_bindings_row                      sys_xs_sbss.bindings;
    declare p_computed_hash                     bytea;
    declare p_message                           text;
    declare p_current_servicebroker_user_name   text;
begin
    -- Load config
    select * from sys_xs_sbss.config limit 1 into p_config;

    -- Parameter checks
    if ( (p_service_user_name is null) or (p_service_user_name = ''))  then
        raise exception 'Parameter error: p_service_user_name cannot be empty.';
    end if;
    if ((p_service_user_password is null) or (p_service_user_password = '')) then
        raise exception 'Parameter error: p_service_user_password cannot be empty.';
    end if;

    -- Determine the servicebroker's technical user, which is the name of the Session User
    select session_user into p_current_servicebroker_user_name;

    -- Find credential
    select * into p_bindings_row
        from sys_xs_sbss.bindings
        where (p_service_user_name = bindings.service_user_name);
    if not found then
        p_message := format('Credential validation failed for servicebroker user (%I). No credential (%I) found.',p_current_servicebroker_user_name,p_service_user_name);
        perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level);
        return p_returndata;
    end if;

    -- Ensure that validating servicebroker user is the same as the user that generated the credential
    if (p_bindings_row.servicebroker_user_name != '') then
        if (p_bindings_row.servicebroker_user_name != p_current_servicebroker_user_name) then
            raise exception 'Credential validation failed for servicebroker user (%). The credential (%) has been generated by another servicebroker user (%). ', P_current_servicebroker_user_name, p_service_user_name, p_bindings_row.servicebroker_user_name;
        end if;
    end if;

    if (p_bindings_row.failed_credential_checks > p_config.max_pass_fail_attempts) then
        p_message := format('Credential validation failed for servicebroker user (%I). Credential (%I) locked.',p_current_servicebroker_user_name, p_service_user_name);
        perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level);
        return p_returndata;
    end if;
    select sys_xs_sbss.compute_digest(p_service_user_password, p_bindings_row.service_user_password_salt) into p_computed_hash;
    if (p_computed_hash = p_bindings_row.service_user_password_hash) then
        -- Password validated successfully
        if (p_bindings_row.failed_credential_checks > 0) then
            -- Reset invalid password check counter
            update sys_xs_sbss.bindings
                set failed_credential_checks=0
                where (p_service_user_name = bindings.service_user_name);
            p_message := format('Credential validation successful for servicebroker user (%I) and credential (%I). Resetting failed password counter.',p_current_servicebroker_user_name, p_service_user_name);
            perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level);
        else
            p_message := format('Credential validation successful for servicebroker user (%I) and credential (%I).',p_current_servicebroker_user_name, p_service_user_name);
            -- NGPBUG-131908: Write successful validation only if verbose is configured
            perform sys_xs_sbss.write_audit(p_message,'verbose',p_config.audit_level);
        end if;
        p_returndata.instance_id := p_bindings_row.instance_id;
        p_returndata.binding_id := p_bindings_row.binding_id;
    else
        update sys_xs_sbss.bindings
            set failed_credential_checks=failed_credential_checks+1
            where (p_service_user_name = bindings.service_user_name);
        p_message := format('Credential validation failed for servicebroker user (%I) and credential (%I). Invalid credential. Increasing failed password counter.',p_current_servicebroker_user_name, p_service_user_name);
        perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level);
        return p_returndata;
    end if;
    return p_returndata;
end;
$$ language plpgsql;
grant execute on function sys_xs_sbss.validate_binding_credential(text, text) to sbss_user;

create or replace function sys_xs_sbss.validate_binding_credential_v2(
    in p_service_user_name                      text, 
    in p_service_user_password                  text)
    returns                                     sys_xs_sbss.service_v2
    security definer
as $$
    declare p_config sys_xs_sbss.config;
    declare p_returndata                        sys_xs_sbss.service_v2;
    declare p_bindings_row                      sys_xs_sbss.bindings;
    declare p_computed_hash                     bytea;
    declare p_message                           text;
    declare p_current_servicebroker_user_name   text;
begin
    -- Load config
    select * from sys_xs_sbss.config limit 1 into p_config;
    
    -- Parameter checks
    if ( (p_service_user_name is null) or (p_service_user_name = ''))  then
        raise exception 'Parameter error: p_service_user_name cannot be empty.';
    end if;
    if ((p_service_user_password is null) or (p_service_user_password = '')) then
        raise exception 'Parameter error: p_service_user_password cannot be empty.';
    end if;
    
    -- Determine the servicebroker's technical user, which is the name of the Session User 
    select session_user into p_current_servicebroker_user_name;
    
    -- Find credential
    select * into p_bindings_row 
        from sys_xs_sbss.bindings 
        where (p_service_user_name = bindings.service_user_name);
    if not found then
        p_message := format('Credential validation failed for servicebroker user (%I). No credential (%I) found.',p_current_servicebroker_user_name,p_service_user_name);
        perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level); 
        return p_returndata; 
    end if;
    
    -- Ensure that validating servicebroker user is the same as the user that generated the credential
    if (p_bindings_row.servicebroker_user_name != '') then
        if (p_bindings_row.servicebroker_user_name != p_current_servicebroker_user_name) then
            raise exception 'Credential validation failed for servicebroker user (%). The credential (%) has been generated by another servicebroker user (%). ', P_current_servicebroker_user_name, p_service_user_name, p_bindings_row.servicebroker_user_name; 
        end if;
    end if;

    if (p_bindings_row.failed_credential_checks > p_config.max_pass_fail_attempts) then
        p_message := format('Credential validation failed for servicebroker user (%I). Credential (%I) locked.',p_current_servicebroker_user_name, p_service_user_name);
        perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level); 
        return p_returndata; 
    end if;
    select sys_xs_sbss.compute_digest(p_service_user_password, p_bindings_row.service_user_password_salt) into p_computed_hash;
    if (p_computed_hash = p_bindings_row.service_user_password_hash) then
        -- Password validated successfully
        if (p_bindings_row.failed_credential_checks > 0) then
            -- Reset invalid password check counter
            update sys_xs_sbss.bindings 
                set failed_credential_checks=0 
                where (p_service_user_name = bindings.service_user_name);
            p_message := format('Credential validation successful for servicebroker user (%I) and credential (%I). Resetting failed password counter.',p_current_servicebroker_user_name, p_service_user_name);
            perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level);
        else
            p_message := format('Credential validation successful for servicebroker user (%I) and credential (%I).',p_current_servicebroker_user_name, p_service_user_name);
            -- NGPBUG-131908: Write successful validation only if verbose is configured
            perform sys_xs_sbss.write_audit(p_message,'verbose',p_config.audit_level);
        end if;
        p_returndata.instance_id := p_bindings_row.instance_id;
        p_returndata.binding_id := p_bindings_row.binding_id;
        p_returndata.service_id := p_bindings_row.service_id;
        p_returndata.plan_id := p_bindings_row.plan_id;
        p_returndata.app_guid := p_bindings_row.app_guid;
        p_returndata.sub_account_id := p_bindings_row.sub_account_id;
    else
        update sys_xs_sbss.bindings 
            set failed_credential_checks=failed_credential_checks+1 
            where (p_service_user_name = bindings.service_user_name);
        p_message := format('Credential validation failed for servicebroker user (%I) and credential (%I). Invalid credential. Increasing failed password counter.',p_current_servicebroker_user_name, p_service_user_name);
        perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level); 
        return p_returndata; 
    end if;
    return p_returndata;    
end;
$$ language plpgsql;  
grant execute on function sys_xs_sbss.validate_binding_credential_v2(text, text) to sbss_user;

create or replace function sys_xs_sbss.validate_extended_binding_credential(
    in p_service_user_name                      text,
    in p_service_user_password                  text)
    returns                                     sys_xs_sbss.extended_service
    security definer
as $$
    declare p_config sys_xs_sbss.config;
    declare p_returndata                        sys_xs_sbss.extended_service;
    declare p_bindings_row                      sys_xs_sbss.bindings;
    declare p_computed_hash                     bytea;
    declare p_message                           text;
    declare p_current_servicebroker_user_name   text;
begin
    -- Load config
    select * from sys_xs_sbss.config limit 1 into p_config;

    -- Parameter checks
    if ( (p_service_user_name is null) or (p_service_user_name = ''))  then
        raise exception 'Parameter error: p_service_user_name cannot be empty.';
    end if;
    if ((p_service_user_password is null) or (p_service_user_password = '')) then
        raise exception 'Parameter error: p_service_user_password cannot be empty.';
    end if;

    -- Determine the servicebroker's technical user, which is the name of the Session User
    select session_user into p_current_servicebroker_user_name;

    -- Find credential
    select * into p_bindings_row
        from sys_xs_sbss.bindings
        where (p_service_user_name = bindings.service_user_name);
    if not found then
        p_message := format('Credential validation failed for servicebroker user (%I). No credential (%I) found.',p_current_servicebroker_user_name,p_service_user_name);
        perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level);
        return p_returndata;
    end if;

    -- Ensure that validating servicebroker user is the same as the user that generated the credential
    if (p_bindings_row.servicebroker_user_name != '') then
        if (p_bindings_row.servicebroker_user_name != p_current_servicebroker_user_name) then
            raise exception 'Credential validation failed for servicebroker user (%). The credential (%) has been generated by another servicebroker user (%). ', P_current_servicebroker_user_name, p_service_user_name, p_bindings_row.servicebroker_user_name;
        end if;
    end if;

    if (p_bindings_row.failed_credential_checks > p_config.max_pass_fail_attempts) then
        p_message := format('Credential validation failed for servicebroker user (%I). Credential (%I) locked.',p_current_servicebroker_user_name, p_service_user_name);
        perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level);
        return p_returndata;
    end if;
    select sys_xs_sbss.compute_digest(p_service_user_password, p_bindings_row.service_user_password_salt) into p_computed_hash;
    if (p_computed_hash = p_bindings_row.service_user_password_hash) then
        -- Password validated successfully
        if (p_bindings_row.failed_credential_checks > 0) then
            -- Reset invalid password check counter
            update sys_xs_sbss.bindings
                set failed_credential_checks=0
                where (p_service_user_name = bindings.service_user_name);
            p_message := format('Credential validation successful for servicebroker user (%I) and credential (%I). Resetting failed password counter.',p_current_servicebroker_user_name, p_service_user_name);
            perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level);
        else
            p_message := format('Credential validation successful for servicebroker user (%I) and credential (%I).',p_current_servicebroker_user_name, p_service_user_name);
            -- NGPBUG-131908: Write successful validation only if verbose is configured
            perform sys_xs_sbss.write_audit(p_message,'verbose',p_config.audit_level);
        end if;
        p_returndata.instance_id := p_bindings_row.instance_id;
        p_returndata.binding_id := p_bindings_row.binding_id;
        p_returndata.service_id := p_bindings_row.service_id;
        p_returndata.plan_id := p_bindings_row.plan_id;
        p_returndata.app_guid := p_bindings_row.app_guid;
    else
        update sys_xs_sbss.bindings
            set failed_credential_checks=failed_credential_checks+1
            where (p_service_user_name = bindings.service_user_name);
        p_message := format('Credential validation failed for servicebroker user (%I) and credential (%I). Invalid credential. Increasing failed password counter.',p_current_servicebroker_user_name, p_service_user_name);
        perform sys_xs_sbss.write_audit(p_message,'normal',p_config.audit_level);
        return p_returndata;
    end if;
    return p_returndata;
end;
$$ language plpgsql;
grant execute on function sys_xs_sbss.validate_extended_binding_credential(text, text) to sbss_user;



